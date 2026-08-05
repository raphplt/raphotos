import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const serif = Instrument_Serif({
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	variable: "--font-serif",
	display: "swap",
});

const sans = Inter({
	subsets: ["latin"],
	variable: "--font-sans-body",
	display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://raphotos.fr";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Raphotos — photographie de paysage",
		template: "%s · Raphotos",
	},
	description:
		"Photographies de paysages et de lumière par Raphaël. Galerie de tirages numériques, librement téléchargeables sous licence CC BY-NC.",
	openGraph: {
		type: "website",
		locale: "fr_FR",
		siteName: "Raphotos",
		url: siteUrl,
	},
	twitter: { card: "summary_large_image" },
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
	colorScheme: "dark",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="fr" className={`${serif.variable} ${sans.variable}`}>
			<body className="min-h-dvh antialiased">
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
