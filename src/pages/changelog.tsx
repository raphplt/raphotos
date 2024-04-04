import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";

export default function Changelog() {
  return (
			<div>
				<Metadata title="Accueil" description="Bienvenue sur Raphotos" />

				<Header />
				<div className="h-[75vh]">
					<h1 className="mt-24 text-center text-3xl">
						Hum, c&apos;est un peu vide par ici...
					</h1>
					<p className="text-center mt-12 text-xl">
						Nous vous invitons à revenir un peu plus tard, cette page est encore en
						construction
					</p>
				</div>

				<Footer />
			</div>
		);
}
