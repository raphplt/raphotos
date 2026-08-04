import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabasePublic = createClient(
	url ?? "https://placeholder.supabase.co",
	anonKey ?? "placeholder-anon-key",
	{ auth: { persistSession: false, autoRefreshToken: false } },
);
