import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";

export const VISITOR_COOKIE = "raphotos_visitor";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Identifiant visiteur anonyme, posé en cookie httpOnly. Aucune donnée
 * personnelle : c'est un UUID opaque servant uniquement à éviter qu'un même
 * navigateur compte plusieurs fois le même « j'aime ».
 */
export async function getOrCreateVisitorId(): Promise<string> {
	const cookieStore = await cookies();
	const existing = cookieStore.get(VISITOR_COOKIE)?.value;
	if (existing) return existing;

	const id = randomUUID();
	cookieStore.set(VISITOR_COOKIE, id, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: ONE_YEAR,
		path: "/",
	});
	return id;
}

/**
 * Empreinte salée de l'adresse IP. Sert au rate limiting et à la modération
 * sans jamais conserver l'IP en clair (RGPD).
 */
export async function getIpHash(): Promise<string> {
	const headerList = await headers();
	const forwarded = headerList.get("x-forwarded-for");
	const ip = forwarded?.split(",")[0]?.trim() ?? "0.0.0.0";
	const salt = process.env.IP_HASH_SALT ?? "raphotos-dev-salt";
	return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
