import { supabase } from "./supabase";

export type UserRole = "admin" | "operator";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export const ADMIN_EMAIL = "admin@planetive.org";

/** Mock auth only when explicitly enabled. Real Supabase is the default when configured. */
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";

const LEGACY_MOCK_USER_KEY = "biochar_mock_user";

function mapUser(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): PublicUser {
  const email = (user.email ?? "").toLowerCase();
  const metaName = user.user_metadata?.name;
  const name =
    typeof metaName === "string" && metaName.trim()
      ? metaName.trim()
      : email.split("@")[0] || "User";

  const metaRole = user.user_metadata?.role;
  const role: UserRole =
    metaRole === "admin" || email === ADMIN_EMAIL ? "admin" : "operator";

  return {
    id: user.id,
    name,
    email,
    role,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

function configError() {
  return {
    error:
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env",
  };
}

function makeMockUser(
  name: string,
  email: string,
  role: UserRole = "operator",
): PublicUser {
  return {
    id: `mock-${btoa(email).replace(/=+/g, "")}`,
    name: name.trim() || email.split("@")[0] || "User",
    email: email.trim().toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
  };
}

function assertRoleAccess(
  selectedRole: UserRole,
  email: string,
): { error: string } | null {
  const normalized = email.trim().toLowerCase();
  if (selectedRole === "admin" && normalized !== ADMIN_EMAIL) {
    return { error: "Admin access is limited to Admin@planetive.org." };
  }
  if (selectedRole === "operator" && normalized === ADMIN_EMAIL) {
    return { error: "Use the Admin role to sign in with this account." };
  }
  return null;
}

function assertUserMatchesRole(
  user: PublicUser,
  selectedRole: UserRole,
): { error: string } | null {
  if (user.role !== selectedRole) {
    return {
      error:
        selectedRole === "admin"
          ? "This account is not an admin."
          : "This account is registered as Admin. Switch role to Admin.",
    };
  }
  return null;
}

export async function getSession(): Promise<PublicUser | null> {
  if (USE_MOCK_AUTH) {
    try {
      localStorage.removeItem(LEGACY_MOCK_USER_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }

  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return mapUser(data.user);
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ user: PublicUser } | { error: string; needsEmailConfirm?: boolean }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role;

  if (role === "admin") {
    return {
      error: "Admin accounts cannot be created from Sign up. Please log in instead.",
    };
  }

  if (!name) return { error: "Please enter your name." };
  if (!email) return { error: "Please enter your email." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const accessError = assertRoleAccess(role, email);
  if (accessError) return accessError;

  const displayName = name;

  if (USE_MOCK_AUTH) {
    return { user: makeMockUser(displayName, email, role) };
  }

  if (!supabase) return configError();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: displayName, role },
    },
  });

  if (error) return { error: error.message };

  if (!data.user) {
    return { error: "Could not create account. Please try again." };
  }

  // Supabase can return a user with empty identities when the email already exists
  // and email confirmation / duplicate protection is on.
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: "An account with this email already exists. Please log in." };
  }

  if (!data.session) {
    return {
      error: "Account created. Check your email to confirm, then log in.",
      needsEmailConfirm: true,
    };
  }

  const user = mapUser(data.user);
  const roleError = assertUserMatchesRole(user, role);
  if (roleError) {
    await supabase.auth.signOut();
    return roleError;
  }

  return { user };
}

export async function logIn(input: {
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ user: PublicUser } | { error: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role;

  if (!email) return { error: "Please enter your email." };
  if (!password) return { error: "Please enter your password." };

  const accessError = assertRoleAccess(role, email);
  if (accessError) return accessError;

  if (USE_MOCK_AUTH) {
    const displayName =
      role === "admin" ? "Admin" : email.split("@")[0] || "User";
    return { user: makeMockUser(displayName, email, role) };
  }

  if (!supabase) return configError();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("email not confirmed")) {
      return {
        error: "Please confirm your email before logging in. Check your inbox.",
      };
    }
    if (message.includes("invalid login")) {
      return { error: "Invalid email or password." };
    }
    return { error: error.message };
  }

  if (!data.user) return { error: "Login failed. Please try again." };

  let user = mapUser(data.user);

  // Backfill role/name metadata for accounts created before roles existed
  if (data.user.user_metadata?.role !== user.role) {
    const { data: updated, error: updateError } = await supabase.auth.updateUser({
      data: { name: user.name, role: user.role },
    });
    if (!updateError && updated.user) {
      user = mapUser(updated.user);
    }
  }

  const roleError = assertUserMatchesRole(user, role);
  if (roleError) {
    await supabase.auth.signOut();
    return roleError;
  }

  return { user };
}

export async function logOut() {
  if (USE_MOCK_AUTH) return;

  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthChange(callback: (user: PublicUser | null) => void) {
  if (USE_MOCK_AUTH || !supabase) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? mapUser(session.user) : null);
  });
}
