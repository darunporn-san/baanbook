const SUPABASE_URL = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SUPABASE_PUBLISHABLE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export function hasSupabaseEnv() {
  return Boolean(
    process.env[SUPABASE_URL] &&
      (process.env[SUPABASE_ANON_KEY] || process.env[SUPABASE_PUBLISHABLE_KEY]),
  );
}

export function getSupabaseEnv() {
  const supabaseUrl = process.env[SUPABASE_URL];
  const supabaseAnonKey =
    process.env[SUPABASE_ANON_KEY] ?? process.env[SUPABASE_PUBLISHABLE_KEY];

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing ${SUPABASE_URL} and ${SUPABASE_ANON_KEY} or ${SUPABASE_PUBLISHABLE_KEY}.`,
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
