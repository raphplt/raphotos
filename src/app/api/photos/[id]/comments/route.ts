import { NextResponse } from "next/server";
import { z } from "zod";

import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getIpHash } from "@/lib/visitor";

const commentSchema = z.object({
	author_name: z.string().trim().min(2).max(40),
	body: z.string().trim().min(2).max(1000),
	/** Champ leurre : rempli uniquement par les robots. */
	website: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: photoId } = await params;

	if (!z.uuid().safeParse(photoId).success) {
		return NextResponse.json({ error: "Photo inconnue" }, { status: 400 });
	}

	const parsed = commentSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Vérifie ton pseudo et ton message (2 à 1000 caractères)." },
			{ status: 400 },
		);
	}

	// Honeypot rempli : on répond comme si tout s'était bien passé, sans écrire.
	if (parsed.data.website) {
		return NextResponse.json({ status: "pending" });
	}

	const ipHash = await getIpHash();
	const limit = rateLimit(`comment:${ipHash}`, 5, 600);
	if (!limit.allowed) {
		return NextResponse.json(
			{ error: "Trop de commentaires envoyés, réessaie dans quelques minutes." },
			{ status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
		);
	}

	const supabase = createSupabaseAdminClient();

	// La photo doit exister et être publiée.
	const { data: photo } = await supabase
		.from("photos")
		.select("id")
		.eq("id", photoId)
		.eq("published", true)
		.maybeSingle();

	if (!photo) {
		return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
	}

	const { error } = await supabase.from("comments").insert({
		photo_id: photoId,
		author_name: parsed.data.author_name,
		body: parsed.data.body,
		status: "pending",
		ip_hash: ipHash,
	});

	if (error) {
		return NextResponse.json({ error: "Envoi impossible" }, { status: 500 });
	}

	return NextResponse.json({ status: "pending" });
}
