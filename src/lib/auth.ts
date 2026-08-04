import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "./supabase/server";

/**
 * Garde-fou des pages et actions d'administration.
 *
 * Le middleware filtre déjà les requêtes, mais il peut être contourné (appel
 * direct d'une Server Action, edge case de matcher) : chaque point d'entrée
 * sensible revérifie donc l'identité ici.
 */
export async function requireAdmin(): Promise<{ email: string }> {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
	const email = user?.email?.toLowerCase();

	if (!email || !adminEmail || email !== adminEmail) {
		redirect("/admin/login");
	}

	return { email };
}
