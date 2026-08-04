import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

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

	const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
	return NextResponse.redirect(`${origin}${safeNext}`);
}
