export const IMAGE_VARIANTS = {
	thumb: { width: 480, quality: 55 },
	grid: { width: 1280, quality: 58 },
	full: { width: 2560, quality: 62 },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

export const VARIANT_ORDER: ImageVariant[] = ["thumb", "grid", "full"];

export function pickVariant(width: number): ImageVariant {
	for (const variant of VARIANT_ORDER) {
		if (IMAGE_VARIANTS[variant].width >= width) return variant;
	}
	return "full";
}

export const CDN_URL = (
	process.env.NEXT_PUBLIC_CDN_URL ?? "https://cdn.raphotos.fr"
).replace(/\/$/, "");

export function variantUrl(key: string, variant: ImageVariant): string {
	return `${CDN_URL}/photos/${key}/${variant}.avif`;
}

export function originalUrl(key: string, extension = "jpg"): string {
	return `${CDN_URL}/photos/${key}/original.${extension}`;
}
