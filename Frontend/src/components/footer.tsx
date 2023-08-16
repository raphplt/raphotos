import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 pb-12 bottom-0 w-full">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="px-4">
            <h2 className="text-lg font-semibold mb-2">Raphotos</h2>
            <p className="text-md w-2/3">
              Copyright © {new Date().getFullYear()} Raphotos. Tous droits
              réservés
            </p>
          </div>
          <div className="px-4 ">
            <h2 className="text-lg font-semibold mb-2">Pages</h2>
            <ul className="list-disc pl-3">
              <li>
                <Link href="/decouvrir">Photos</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/shop">Shop</Link>
              </li>
              <li>
                <Link href="/a-propos">A propos</Link>
              </li>
            </ul>
          </div>
          <div className="px-4">
            <h2 className="text-lg font-semibold mb-2">Ressources</h2>
            <ul className="list-disc pl-3">
              <li>
                <Link href="/decouvrir">Plan du site</Link>
              </li>
              <li>
                <Link href="/decouvrir">Mentions légales</Link>
              </li>
              <li>
                <Link href="/decouvrir">Confidentialité</Link>
              </li>
              <li>
                <Link href="/decouvrir">Ventes et remboursement</Link>
              </li>
            </ul>
            <ul className="list-disc pl-3"></ul>
          </div>
          <div className="px-4">
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p>Email : raphael.plassart@gmail.com</p>
            <a href="https://www.instagram.com/raph.otos/" target="_blank">
              Instagram: @raph.otos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
