"use client";

import { pickVariant } from "./image-variants";

/**
 * Loader custom pour next/image.
 *
 * Les variantes étant pré-générées et déposées sur R2, il n'y a aucune
 * transformation à la volée : on se contente de réécrire le segment de
 * variante de l'URL en fonction de la largeur demandée par next/image.
 * Effet de bord voulu : l'optimiseur d'images de Vercel n'est jamais
 * sollicité, donc jamais facturé.
 */
export default function cdnImageLoader({
	src,
	width,
}: {
	src: string;
	width: number;
	quality?: number;
}): string {
	// Les rares images locales (logo, og par défaut) passent sans réécriture.
	if (src.startsWith("/") || !src.includes("/photos/")) return src;

	return src.replace(
		/\/(thumb|grid|full)\.avif$/,
		`/${pickVariant(width)}.avif`,
	);
}
