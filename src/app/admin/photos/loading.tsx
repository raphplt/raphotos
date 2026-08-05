/**
 * La page est dynamique et rapatrie plusieurs centaines de lignes : sans cet
 * état intermédiaire, cliquer un filtre ne produisait aucun retour visuel
 * pendant le rendu serveur, ce qui laissait croire que le clic n'avait rien
 * déclenché.
 */
export default function LoadingAdminPhotos() {
	return (
		<div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
			<div className="h-10 w-48 animate-pulse bg-ink-soft" />
			<div className="mt-4 h-4 w-64 animate-pulse bg-ink-soft" />

			<div className="mt-8 flex flex-wrap gap-2">
				{Array.from({ length: 8 }, (_, i) => (
					<div key={i} className="h-9 w-36 animate-pulse bg-ink-soft" />
				))}
			</div>

			<div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
				{Array.from({ length: 18 }, (_, i) => (
					<div key={i} className="aspect-square animate-pulse bg-ink-soft" />
				))}
			</div>
		</div>
	);
}
