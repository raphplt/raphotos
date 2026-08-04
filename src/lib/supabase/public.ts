import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Faux quand les variables d'environnement ne sont pas renseignées. Permet au
 * site de se construire (et d'afficher des états vides) avant que la base ne
 * soit provisionnée — utile en CI et sur les déploiements de prévisualisation.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Client anonyme sans session, utilisable pendant la génération statique et
 * l'ISR (où `cookies()` n'est pas disponible). RLS s'applique : seul le
 * contenu publié remonte.
 */
export const supabasePublic = createClient(
	url ?? "https://placeholder.supabase.co",
	anonKey ?? "placeholder-anon-key",
	{ auth: { persistSession: false, autoRefreshToken: false } },
);
