import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Point d'atterrissage du lien magique : échange le code contre une session,
 * puis redirige vers l'espace d'administration.
 */
export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? "/admin";

	if (!code) {
		return NextResponse.redirect(`${origin}/admin/login?error=missing_code`);
	}

	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		return NextResponse.redirect(`${origin}/admin/login?error=invalid_code`);
	}

	// `next` provient de l'URL : on n'accepte qu'un chemin interne, pour éviter
	// une redirection ouverte vers un domaine tiers.
	const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
	return NextResponse.redirect(`${origin}${safeNext}`);
}
