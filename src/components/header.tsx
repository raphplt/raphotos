import Link from "next/link";

/* eslint-disable @next/next/no-img-element */
export default function Header() {
  return (
    <header className="flex justify-center gap-6 sm:gap-0 z-10 bg-white py-4 top-0 sm:justify-around items-center sm:mx-20 w-[100vw] fixed ">
      <Link href={"/"} className="hover:underline underline-offset-2">
        Raphotos
      </Link>
      <div className="flex gap-2 sm:gap-20">
        <Link
          href={"/decouvrir"}
          className="hover:underline underline-offset-2"
        >
          Découvrir
        </Link>
        <Link href={"/blog"} className="hover:underline underline-offset-2">
          Blog
        </Link>
        <Link href={"/shop"} className="hover:underline underline-offset-2">
          Shop
        </Link>
        <Link href={"/a-propos"} className="hover:underline underline-offset-2">
          A propos
        </Link>
      </div>
    </header>
  );
}
