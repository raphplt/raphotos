import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 pb-8 bottom-0 w-full">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="px-4 flex flex-col gap-1">
            <h2 className="text-lg font-semibold mb-2">Raphotos</h2>
            <p className="text-md w-2/3">
              Copyright © {new Date().getFullYear()} Raphotos. Tous droits
              réservés
            </p>
          </div>
          <div className="px-4 ">
            <h2 className="text-lg font-semibold mb-2">Pages</h2>
            <ul className="list-disc pl-3 flex flex-col gap-1">
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/">Accueil</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/photos">Photos</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/videos">Vidéos</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/a-propos">A propos</Link>
              </li>
            </ul>
          </div>
          <div className="px-4">
            <h2 className="text-lg font-semibold mb-2">Ressources</h2>
            <ul className="list-disc pl-3 flex flex-col gap-1">
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/sitemap">Plan du site</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/mentions-legales">Mentions légales</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/decouvrir">Confidentialité</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link href="/decouvrir">Ventes et remboursement</Link>
              </li>
            </ul>
            <ul className="list-disc pl-3"></ul>
          </div>
          <div className="px-4 flex flex-col gap-1">
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <ul className="list-disc pl-3 flex flex-col gap-1">
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                Email : raphael.plassart@gmail.com
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <a href="https://www.instagram.com/raph.otos/" target="_blank">
                  Instagram: @raph.otos
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center mt-14 font-semibold">
          Copyright © {new Date().getFullYear()} Raphotos. Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
