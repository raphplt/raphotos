import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";

export default function APropos() {
  return (
    <div>
      <Metadata />
      <Header />
      <div className="mt-24 h-[100vh]">
        <h1 className="mt-28 text-2xl text-center bg-black text-white w-fit mx-auto px-24 py-1">
          A propos
        </h1>
        <p className="w-1/4 mx-auto mt-16 text-justify">
          Bienvenue sur mon site web dédié à la photographie ! Je m&apos;appelle
          Raphaël, j&apos;ai 19 ans et je suis un passioné de photos depuis
          plusieurs années. Je photographie principalement des paysages, mais je
          m&apos;essaie aussi aux portraits où à d&apos;autres styles de
          photographies.
          <br />A travers mes clichés, j&apos;essaie de mettre en valeur la
          poésie qui se cache dans les paysages et les détails qu&apos;on ne
          regarde pas.
          <br />
          <br />
          Mon matériel actuel:
          <br />- Sony Alph 6000
          <br />- Objectif Sony 16-50mm
          <br />- Objectif Sony 55-210mm
          <br />- Trépied Boulanger Essentiels
          <br />
          <br />
          Toutes les photos sont téléchargables et utilisables sous la licnce CC
          by NC (pas d&apos;utilisation commerciale).
          <br />
          <br />
          Le site en est actuellement à sa version 2, en date du 23/09/2023. Si
          vous remarquez un bug (hors ralentissement), ou que vous souhaitez
          discuter de photo, vous pouvez me contacter sur mon instagram dédié
          (@raph.otos).
          <br />
          <br />
          Merci beaucoup d&apos;être passé !
          <br />
          <br />
          Mes autres sites internet :
          <br />
          <br />
          <a
            href="https://www.raph-portfolio.fr"
            target="_blank"
            rel="noreferrer"
            className="bg-slate-300 px-5 py-2 drop-shadow-md"
          >
            Mon portfolio
          </a>
        </p>
      </div>
      <Footer />
    </div>
  );
}
