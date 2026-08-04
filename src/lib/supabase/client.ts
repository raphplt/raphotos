"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Client navigateur — utilisé uniquement pour l'authentification de l'admin. */
export function createSupabaseBrowserClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
