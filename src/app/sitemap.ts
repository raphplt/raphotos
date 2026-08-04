import type { MetadataRoute } from "next";

import { getAlbums, getAllPhotoSlugs } from "@/lib/queries";

const siteUrl = (
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://raphotos.fr"
).replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [albums, photos] = await Promise.all([getAlbums(), getAllPhotoSlugs()]);

	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: `${siteUrl}/`, priority: 1, changeFrequency: "weekly" },
		{ url: `${siteUrl}/photos`, priority: 0.9, changeFrequency: "weekly" },
		{ url: `${siteUrl}/videos`, priority: 0.6, changeFrequency: "monthly" },
		{ url: `${siteUrl}/a-propos`, priority: 0.5, changeFrequency: "yearly" },
	];

	const albumRoutes: MetadataRoute.Sitemap = albums.map((album) => ({
		url: `${siteUrl}/photos/${album.slug}`,
		priority: 0.8,
		changeFrequency: "monthly",
	}));

	const photoRoutes: MetadataRoute.Sitemap = photos
		.filter((photo) => photo.album_slug)
		.map((photo) => ({
			url: `${siteUrl}/photos/${photo.album_slug}/${photo.slug}`,
			priority: 0.6,
			changeFrequency: "yearly",
		}));

	return [...staticRoutes, ...albumRoutes, ...photoRoutes];
}
