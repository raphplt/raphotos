import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";

export default function SiteMap() {
  return (
    <div className="">
      <Header />
      <Metadata />
      <div className="w-1/2 mx-auto mt-36 text-lg gap-5 flex flex-col text-center h-[80vh]">
        <h1 className="font-semibold">Plan du site</h1>
        <h2>Accueil</h2>
        <h2>Photos</h2>
        <h2>Vidéos</h2>
        <h2>A propos</h2>
      </div>

      <Footer />
    </div>
  );
}
