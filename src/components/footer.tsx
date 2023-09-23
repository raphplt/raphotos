import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 pb-8 bottom-0 w-full">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mx-auto w-11/12">
          <div className="px-4 mt-2 flex flex-col gap-1">
            <h2 className="text-lg font-semibold mb-2">Raphotos</h2>
            <Image
              src={require("public/assets/logos/raphotos.png")}
              alt="logo"
              width={70}
              height={70}
              className="w-16 sm:w-20 mt-2"
            />
          </div>
          <div className="px-4 ">
            <h2 className="text-lg font-semibold mb-2">Pages</h2>
            <ul className="list-disc pl-2 flex flex-col gap-1 text-gray-300">
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
            <ul className="list-disc pl-2 flex flex-col gap-1 text-gray-300">
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
            <ul className="list-disc sm:pl-2 flex flex-col gap-1 text-gray-300 mx-auto justify-center">
              <li className="transform hover:translate-x-2 transition-transform duration-300 ">
                <div className="flex justify-center items-center gap-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 sm:w-10 sm:h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>

                  <p>raphael.plassart@gmail.com</p>
                </div>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <a
                  href="https://www.instagram.com/raph.otos/"
                  target="_blank"
                  className="flex gap-5 sm:ml-1 items-center"
                >
                  <Image
                    src={require("public/assets/logos/insta.png")}
                    alt="logo"
                    width={70}
                    height={70}
                    className="w-5 sm:w-8 mt-2"
                  />
                  <p>@raph.otos</p>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center mt-20 font-semibold">
          Copyright © {new Date().getFullYear()} Raphotos. Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
