import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/** Null when credentials are missing — do not call createClient with empty URL. */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!useMockAuth && !supabase) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to artifacts/mrv-platform/.env",
  );
}
