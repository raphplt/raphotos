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

/** « Summer_2023 » → « Été 2023 ». Retombe sur le nom brut si non reconnu. */
export function formatAlbumTitle(folderName: string): string {
	const [season, year] = folderName.split("_");
	if (!season) return folderName;
	const label = SEASON_LABELS[season];
	if (!label || !year) return folderName.replace(/_/g, " ");
	return `${label} ${year}`;
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

/** « 1/250 » à partir d'une vitesse d'obturation en secondes. */
export function formatShutterSpeed(seconds: number | null): string {
	if (!seconds) return "";
	if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
	return `1/${Math.round(1 / seconds)}`;
}

export function pluralize(count: number, singular: string, plural?: string) {
	return count > 1 ? (plural ?? `${singular}s`) : singular;
}
