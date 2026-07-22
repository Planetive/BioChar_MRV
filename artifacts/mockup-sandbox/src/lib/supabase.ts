import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to artifacts/mockup-sandbox/.env",
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}
