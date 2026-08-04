"use client";

import { pickVariant } from "./image-variants";

export default function cdnImageLoader({
	src,
	width,
}: {
	src: string;
	width: number;
	quality?: number;
}): string {
	if (src.startsWith("/") || !src.includes("/photos/")) return src;

	return src.replace(
		/\/(thumb|grid|full)\.avif$/,
		`/${pickVariant(width)}.avif`,
	);
}
