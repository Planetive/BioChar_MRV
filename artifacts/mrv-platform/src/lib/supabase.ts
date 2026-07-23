import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH !== "false";

if (!useMockAuth && (!url || !anonKey)) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to artifacts/mrv-platform/.env",
  );
}
export const supabase = createClient(url ?? "", anonKey ?? "");

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}
