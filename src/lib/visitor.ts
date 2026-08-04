import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";

export const VISITOR_COOKIE = "raphotos_visitor";
const ONE_YEAR = 60 * 60 * 24 * 365;

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

export async function getIpHash(): Promise<string> {
	const headerList = await headers();
	const forwarded = headerList.get("x-forwarded-for");
	const ip = forwarded?.split(",")[0]?.trim() ?? "0.0.0.0";
	const salt = process.env.IP_HASH_SALT ?? "raphotos-dev-salt";
	return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
