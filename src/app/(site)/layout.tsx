import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

/**
 * Chrome du site public. L'administration vit hors de ce groupe : son en-tête
 * est le sien, et le Header public — qui est en position fixed — n'a rien à
 * faire par-dessus.
 */
export default function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<a
				href="#contenu"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
			>
				Aller au contenu
			</a>
			<Header />
			<main id="contenu">{children}</main>
			<Footer />
		</>
	);
}
