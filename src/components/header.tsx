import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  const genericHamburgerLine = `h-1 w-6 my-1 rounded-full bg-black transition ease transform duration-300`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const size = window.innerWidth;
      if (size > 640) {
        setShowMenu(true);
      }
    }
  }, []);

  return (
    <header className="flex justify-center sm:flex-row flex-col gap-20 sm:gap-0 z-10 bg-white py-3 top-0 sm:justify-around sm:items-center w-[100vw] fixed ">
      <div
        className="flex justify-between w-11/12 mx-auto sm:w-fit sm:mx-0 
       "
      >
        <Link
          href={"/"}
          className="hover:underline underline-offset-2 flex items-center flex-col gap-1"
        >
          <Image
            src={require("public/assets/logos/raphotos.png")}
            alt="logo"
            width={70}
            height={70}
            className="w-16 sm:w-20"
          />
          {/* <h2 className="text-lg font-semibold">Raphotos</h2> */}
        </Link>
        <button
          className="flex flex-col h-12 w-12 rounded justify-center items-center group sm:hidden"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div
            className={`${genericHamburgerLine} ${
              showMenu
                ? "rotate-45 translate-y-3 opacity-50 group-hover:opacity-100"
                : "opacity-50 group-hover:opacity-100"
            }`}
          />
          <div
            className={`${genericHamburgerLine} ${
              showMenu ? "opacity-0" : "opacity-50 group-hover:opacity-100"
            }`}
          />
          <div
            className={`${genericHamburgerLine} ${
              showMenu
                ? "-rotate-45 -translate-y-3 opacity-50 group-hover:opacity-100"
                : "opacity-50 group-hover:opacity-100"
            }`}
          />
        </button>
      </div>
      {showMenu && (
        <div className="flex gap-20 text-xl sm:text-[16px] bg-white sm:gap-20 sm:flex-row flex-col h-[100vh] sm:h-fit w-[100wv] items-center sm:items-start">
          <Link
            href={"/"}
            className="hover:underline underline-offset-2"
            // onClick={() => setShowMenu(false)}
          >
            Accueil
          </Link>
          <Link
            href={"/photos"}
            className="hover:underline underline-offset-2"
            // onClick={() => setShowMenu(false)}
          >
            Photos
          </Link>
          <Link
            href={"/videos"}
            className="hover:underline underline-offset-2"
            // onClick={() => setShowMenu(false)}
          >
            Vidéos
          </Link>
          <Link
            href={"/shop"}
            className="hover:underline underline-offset-2"
            // onClick={() => setShowMenu(false)}
          >
            Shop
          </Link>
          <Link
            href={"/a-propos"}
            className="hover:underline underline-offset-2"
            // onClick={() => setShowMenu(false)}
          >
            A propos
          </Link>
        </div>
      )}
    </header>
  );
}
