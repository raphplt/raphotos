import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Administration",
	robots: { index: false, follow: false },
};

/**
 * L'espace d'administration ne reprend pas l'en-tête public : il occupe
 * l'écran entier et impose un décalage haut nul.
 */
export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="min-h-dvh bg-ink">{children}</div>;
}
