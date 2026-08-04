import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase et verrouille l'espace d'administration.
 *
 * Deux conditions doivent être réunies pour accéder à /admin : être
 * authentifié, et être l'adresse déclarée dans ADMIN_EMAIL. Le contrôle est
 * répété côté page et côté action — le middleware n'est que la première
 * barrière.
 */
export async function middleware(request: NextRequest) {
	let response = NextResponse.next({ request });

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anonKey) return response;

	const supabase = createServerClient(url, anonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}
				response = NextResponse.next({ request });
				for (const { name, value, options } of cookiesToSet) {
					response.cookies.set(name, value, options);
				}
			},
		},
	});

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { pathname } = request.nextUrl;
	const isLoginRoute = pathname.startsWith("/admin/login");
	const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
	const isAdmin =
		Boolean(user?.email) && user!.email!.toLowerCase() === adminEmail;

	if (pathname.startsWith("/admin") && !isLoginRoute && !isAdmin) {
		const redirect = request.nextUrl.clone();
		redirect.pathname = "/admin/login";
		redirect.searchParams.set("next", pathname);
		return NextResponse.redirect(redirect);
	}

	if (isLoginRoute && isAdmin) {
		const redirect = request.nextUrl.clone();
		redirect.pathname = "/admin";
		redirect.search = "";
		return NextResponse.redirect(redirect);
	}

	return response;
}

export const config = {
	matcher: ["/admin/:path*"],
};
