import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client lié à la session de l'utilisateur (cookies). À utiliser dans les
 * Server Components et Route Handlers : les politiques RLS s'appliquent, donc
 * seul le contenu publié est visible pour un visiteur anonyme.
 */
export async function createSupabaseServerClient() {
	const cookieStore = await cookies();

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					for (const { name, value, options } of cookiesToSet) {
						cookieStore.set(name, value, options);
					}
				} catch {
					// Appelé depuis un Server Component : le rafraîchissement de
					// session est pris en charge par le middleware, on ignore.
				}
			},
		},
	});
}

/**
 * Client à privilèges élevés (clé service). Contourne RLS.
 *
 * Réservé aux écritures serveur maîtrisées : likes, dépôt de commentaires,
 * actions d'administration. Ne jamais l'exposer côté client.
 */
export function createSupabaseAdminClient() {
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
	}
	return createClient(supabaseUrl, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}
