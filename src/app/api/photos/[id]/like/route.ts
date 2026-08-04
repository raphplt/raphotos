import { NextResponse } from "next/server";
import { z } from "zod";

import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getIpHash, getOrCreateVisitorId } from "@/lib/visitor";

const bodySchema = z.object({ liked: z.boolean() });

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: photoId } = await params;

	if (!z.uuid().safeParse(photoId).success) {
		return NextResponse.json({ error: "Photo inconnue" }, { status: 400 });
	}

	const parsed = bodySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
	}

	const ipHash = await getIpHash();
	const limit = rateLimit(`like:${ipHash}`, 60, 60);
	if (!limit.allowed) {
		return NextResponse.json(
			{ error: "Trop de requêtes" },
			{ status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
		);
	}

	const visitorId = await getOrCreateVisitorId();
	const supabase = createSupabaseAdminClient();

	if (parsed.data.liked) {
		// onConflict : rejouer un like déjà posé est sans effet.
		const { error } = await supabase
			.from("likes")
			.upsert(
				{ photo_id: photoId, visitor_id: visitorId },
				{ onConflict: "photo_id,visitor_id", ignoreDuplicates: true },
			);
		if (error) {
			return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
		}
	} else {
		const { error } = await supabase
			.from("likes")
			.delete()
			.eq("photo_id", photoId)
			.eq("visitor_id", visitorId);
		if (error) {
			return NextResponse.json({ error: "Suppression impossible" }, { status: 500 });
		}
	}

	const { count } = await supabase
		.from("likes")
		.select("id", { count: "exact", head: true })
		.eq("photo_id", photoId);

	return NextResponse.json({ liked: parsed.data.liked, count: count ?? 0 });
}
