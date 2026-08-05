import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const SEASON_LABELS: Record<string, string> = {
	Spring: "Printemps",
	Summer: "Été",
	Fall: "Automne",
	Autumn: "Automne",
	Winter: "Hiver",
};

const SEASON_ALIASES: Record<string, string> = {
	spring: "Spring",
	printemps: "Spring",
	summer: "Summer",
	ete: "Summer",
	fall: "Fall",
	autumn: "Fall",
	automne: "Fall",
	winter: "Winter",
	hiver: "Winter",
};

// Rang chronologique de la saison dans son année. L'hiver porte l'année de son
// mois de janvier : il ouvre l'année, il ne la ferme pas.
const SEASON_RANKS: Record<string, number> = {
	Winter: 0,
	Spring: 1,
	Summer: 2,
	Fall: 3,
	Autumn: 3,
};

export function parseSeasonYear(input: string): {
	season: string | null;
	year: number | null;
} {
	let season: string | null = null;
	let year: number | null = null;

	for (const part of slugify(input).split("-")) {
		if (!season && SEASON_ALIASES[part]) season = SEASON_ALIASES[part];
		else if (year === null && /^\d{4}$/.test(part)) year = Number(part);
	}

	return { season, year };
}

export function formatAlbumTitle(folderName: string): string {
	const { season, year } = parseSeasonYear(folderName);
	if (!season || year === null) return folderName.replace(/_/g, " ");
	return `${SEASON_LABELS[season]} ${year}`;
}

type SortableAlbum = {
	season: string | null;
	year: number | null;
	sort_order: number;
	title: string;
};

/** Plus récent d'abord : année, puis saison, puis tri manuel. */
export function compareAlbumsByRecency(a: SortableAlbum, b: SortableAlbum): number {
	const yearA = a.year ?? Number.NEGATIVE_INFINITY;
	const yearB = b.year ?? Number.NEGATIVE_INFINITY;
	if (yearA !== yearB) return yearB - yearA;

	const seasonA = a.season ? (SEASON_RANKS[a.season] ?? -1) : -1;
	const seasonB = b.season ? (SEASON_RANKS[b.season] ?? -1) : -1;
	if (seasonA !== seasonB) return seasonB - seasonA;

	if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
	return a.title.localeCompare(b.title, "fr");
}

export function slugify(input: string): string {
	return input
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // diacritiques décomposés
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function formatDate(value: string | Date | null | undefined): string {
	if (!value) return "";
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);
}

export function formatRelativeDate(value: string | Date): string {
	const date = typeof value === "string" ? new Date(value) : value;
	const diff = Date.now() - date.getTime();
	const minutes = Math.round(diff / 60_000);
	const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

	if (minutes < 60) return rtf.format(-minutes, "minute");
	const hours = Math.round(minutes / 60);
	if (hours < 24) return rtf.format(-hours, "hour");
	const days = Math.round(hours / 24);
	if (days < 30) return rtf.format(-days, "day");
	return formatDate(date);
}

export function formatShutterSpeed(seconds: number | null): string {
	if (!seconds) return "";
	if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
	return `1/${Math.round(1 / seconds)}`;
}

export function pluralize(count: number, singular: string, plural?: string) {
	return count > 1 ? (plural ?? `${singular}s`) : singular;
}
