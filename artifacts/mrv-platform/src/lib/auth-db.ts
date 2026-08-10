import { supabase } from "./supabase";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

/** When true (default), auth is local-only — no Supabase/DB required. */
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== "false";

const LEGACY_MOCK_USER_KEY = "biochar_mock_user";

function mapUser(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): PublicUser {
  const metaName = user.user_metadata?.name;
  const name =
    typeof metaName === "string" && metaName.trim()
      ? metaName.trim()
      : user.email?.split("@")[0] || "User";

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

function configError() {
  return {
    error:
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env",
  };
}

function makeMockUser(name: string, email: string): PublicUser {
  return {
    id: `mock-${btoa(email).replace(/=+/g, "")}`,
    name: name.trim() || email.split("@")[0] || "User",
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };
}

export async function getSession(): Promise<PublicUser | null> {
  if (USE_MOCK_AUTH) {
    // Never restore a session — always show login on fresh visit / refresh.
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
}): Promise<{ user: PublicUser } | { error: string; needsEmailConfirm?: boolean }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name) return { error: "Please enter your name." };
  if (!email) return { error: "Please enter your email." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (USE_MOCK_AUTH) {
    return { user: makeMockUser(name, email) };
  }

  if (!supabase) return configError();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) return { error: error.message };

  if (!data.user) {
    return { error: "Could not create account. Please try again." };
  }

  if (!data.session) {
    return {
      error: "Account created. Check your email to confirm, then log in.",
      needsEmailConfirm: true,
    };
  }

  return { user: mapUser(data.user) };
}

export async function logIn(input: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser } | { error: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email) return { error: "Please enter your email." };
  if (!password) return { error: "Please enter your password." };

  if (USE_MOCK_AUTH) {
    return { user: makeMockUser(email.split("@")[0] || "User", email) };
  }

  if (!supabase) return configError();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Login failed. Please try again." };

  return { user: mapUser(data.user) };
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
