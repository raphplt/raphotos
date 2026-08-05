import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
	// On arrive sur le callback avec un code à échanger, donc forcément pas
	// encore authentifié : le protéger rendrait le lien magique inutilisable.
	const isCallbackRoute = pathname.startsWith("/admin/callback");
	const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
	const isAdmin =
		Boolean(user?.email) && user!.email!.toLowerCase() === adminEmail;

	if (pathname.startsWith("/admin") && !isLoginRoute && !isCallbackRoute && !isAdmin) {
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
