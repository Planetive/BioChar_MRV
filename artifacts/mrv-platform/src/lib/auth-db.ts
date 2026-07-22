import { supabase, isSupabaseConfigured } from "./supabase";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

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

export async function getSession(): Promise<PublicUser | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return mapUser(data.user);
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: PublicUser } | { error: string; needsEmailConfirm?: boolean }> {
  if (!isSupabaseConfigured()) return configError();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name) return { error: "Please enter your name." };
  if (!email) return { error: "Please enter your email." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

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
  if (!isSupabaseConfigured()) return configError();

  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Login failed. Please try again." };

  return { user: mapUser(data.user) };
}

export async function logOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export function onAuthChange(callback: (user: PublicUser | null) => void) {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? mapUser(session.user) : null);
  });
}
