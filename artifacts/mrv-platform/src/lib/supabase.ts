import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv(name: string): string {
  const raw = import.meta.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

const url = readEnv("VITE_SUPABASE_URL");
const anonKey = readEnv("VITE_SUPABASE_ANON_KEY");
const useMockAuth = readEnv("VITE_USE_MOCK_AUTH") === "true";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSupabaseConfigured() {
  return Boolean(url && anonKey && isValidHttpUrl(url));
}

function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  try {
    return createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return null;
  }
}

/** Null when credentials are missing or invalid. */
export const supabase: SupabaseClient | null = createSupabaseClient();

if (!useMockAuth && !supabase) {
  console.warn(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Config, not Secret) on Vercel and redeploy.",
  );
}
