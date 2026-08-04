import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "./supabase/server";

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
