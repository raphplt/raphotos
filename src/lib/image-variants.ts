/**
 * Source de vérité des variantes d'images, partagée entre le script d'import
 * (qui les génère) et le front (qui les consomme). Toute modification ici doit
 * s'accompagner d'une réexécution de `npm run import`.
 */
export const IMAGE_VARIANTS = {
	thumb: { width: 480, quality: 55 },
	grid: { width: 1280, quality: 58 },
	full: { width: 2560, quality: 62 },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

/** Ordre croissant, utilisé pour choisir la plus petite variante suffisante. */
export const VARIANT_ORDER: ImageVariant[] = ["thumb", "grid", "full"];

/** Plus petite variante dont la largeur couvre `width`. */
export function pickVariant(width: number): ImageVariant {
	for (const variant of VARIANT_ORDER) {
		if (IMAGE_VARIANTS[variant].width >= width) return variant;
	}
	return "full";
}

export const CDN_URL = (
	process.env.NEXT_PUBLIC_CDN_URL ?? "https://cdn.raphotos.fr"
).replace(/\/$/, "");

/** URL publique d'une variante. `key` est le slug de la photo. */
export function variantUrl(key: string, variant: ImageVariant): string {
	return `${CDN_URL}/photos/${key}/${variant}.avif`;
}

/** URL du fichier original, proposé au téléchargement (licence CC BY-NC). */
export function originalUrl(key: string, extension = "jpg"): string {
	return `${CDN_URL}/photos/${key}/original.${extension}`;
}
