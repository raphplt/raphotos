import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";

export default function Decouvrir() {
  return (
    <div>
      <Metadata />
      <Header />
      <h1>Mes vidéos</h1>
      <div className=" mt-24 w-fit mx-auto flex flex-col justify-center items-center gap-20 mb-24">
        <div>
          <h2 className="mb-5 font-semibold text-center">
            Ma dernière vidéo :
          </h2>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/7LYEla1TJic"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div>
          <h2 className="mb-5 font-semibold text-center">
            Mon voyage au Québec :
          </h2>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/5h3zQvttngM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <Footer />
    </div>
  );
}
