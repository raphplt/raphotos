import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";

export default function MentionsLegales() {
  return (
    <div className="">
      <Header />
      <Metadata />
      <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-md mt-24 mb-24">
        <h1 className="text-2xl font-bold mb-4">
          Mentions Légales de raphotos.fr
        </h1>

        <h2 className="text-xl font-semibold mt-4">
          1. Informations sur l&apos;Éditeur du Site :
        </h2>
        <p>
          Nom de l&apos;éditeur : Raphaël Plassart
          <br />
          Adresse : 1 rue de la paix, 75000 Paris
          <br />
          Téléphone : 01 23 45 67 89
          <br />
          Adresse e-mail : raphael.plassart@gmail.com
          <br />
        </p>

        <h2 className="text-xl font-semibold mt-4">2. Hébergement :</h2>
        <p>
          Ce site est hébergé par : Github Pages
          <br />
          Adresse : 1 rue de la paix, 75000 Paris
          <br />
          Téléphone : 01 23 45 67 89
          <br />
        </p>

        <h2 className="text-xl font-semibold mt-4">
          3. Propriété Intellectuelle :
        </h2>
        <p>
          Tous les contenus présents sur raphotos.fr, y compris les textes, les
          photographies, les vidéos et les graphiques, sont la propriété
          intellectuelle de Raphaël Plassart, sauf indication contraire. Toute
          reproduction, distribution, ou utilisation non autorisée de ces
          contenus est strictement interdite.
        </p>

        <h2 className="text-xl font-semibold mt-4">
          4. Données Personnelles :
        </h2>
        <p>
          Conformément à la réglementation sur la protection des données
          personnelles, Raphaël Plassart s&apos;engage à protéger la vie privée
          des utilisateurs de raphotos.fr. Pour plus d&apos;informations sur la
          collecte, le traitement, et l&apos;utilisation des données
          personnelles, veuillez consulter notre Politique de Confidentialité.
        </p>

        <h2 className="text-xl font-semibold mt-4">5. Cookies :</h2>
        <p>
          raphotos.fr utilise des cookies pour améliorer l&apos;expérience de
          l&apos;utilisateur. Pour en savoir plus sur l&apos;utilisation des
          cookies et comment les gérer, veuillez consulter notre Politique de
          Cookies.
        </p>

        <h2 className="text-xl font-semibold mt-4">6. Liens Externes :</h2>
        <p>
          raphotos.fr peut contenir des liens vers des sites web externes.
          [Votre nom ou le nom de votre entreprise] n&apos;est pas responsable
          du contenu ou de la politique de confidentialité de ces sites tiers.
        </p>

        <h2 className="text-xl font-semibold mt-4">7. Responsabilité :</h2>
        <p>
          Raphaël Plassart s&apos;efforce de fournir des informations exactes et
          à jour sur raphotos.fr, mais ne peut garantir l&apos;exactitude de
          toutes les informations présentes sur le si&apos;ils en font. Raphaël
          Plassart décline toute responsabilité en cas de dommages directs ou
          indirects résultant de l&apos;utilisation du site.
        </p>

        <h2 className="text-xl font-semibold mt-4">8. Contact :</h2>
        <p>
          Pour toute question ou demande concernant ces mentions légales,
          veuillez nous contacter à l&apos;adresse e-mail suivante : Raphaël
          Plassart.
        </p>

        <p className="mt-4">
          Ces mentions légales ont été mises à jour le [Date de la dernière mise
          à jour].
        </p>

        <h2 className="text-xl font-semibold mt-4">
          9. Loi Applicable et Juridiction :
        </h2>
        <p>
          Tout litige concernant raphotos.fr est régi par le droit français et
          sera soumis à la juridiction exclusive des tribunaux de Paris.
        </p>
      </div>
      <Footer />
    </div>
  );
}
