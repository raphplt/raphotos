/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import path from "path";
import fs from "fs/promises";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/footer";

export default function Decouvrir({ imagePaths }: any) {
  return (
    <div>
      <Metadata />
      <Header />
      <div className="w-10/12 mx-auto mb-24">
        <h1 className="my-8 text-2xl text-center mt-16">---- Photos ----</h1>
        <div className="grid grid-cols-3 gap-5 mx-auto ">
          {imagePaths.map((imagePath: any, index: any) => {
            const lastSubfolder = path.basename(path.dirname(imagePath));
            return (
              <Link
                key={index}
                href={`/photos/${lastSubfolder}`}
                className="flex group/item justify-center items-center flex-col drop-shadow-md mb-3"
              >
                <span className="mb-2 group-hover/item:underline underline-offset-2">
                  {lastSubfolder}
                </span>
                <div className="bg-black">
                  <Image
                    src={imagePath}
                    alt={`Image ${index}`}
                    className="group/img w-[30vw] hover:opacity-70 transition-opacity duration-200"
                    width={1000}
                    height={700}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const picturesDirectory = path.join(process.cwd(), "public/assets/pictures");
  const subdirectories = await fs.readdir(picturesDirectory);

  const imagePaths = [];

  for (const subdirectory of subdirectories) {
    if (subdirectory !== "FirstPage") {
      const subdirectoryPath = path.join(picturesDirectory, subdirectory);
      const subdirectoryContents = await fs.readdir(subdirectoryPath);

      const imageFilename = subdirectoryContents.find((filename) => {
        const extension = path.extname(filename).toLowerCase();
        return (
          extension === ".jpg" ||
          extension === ".jpeg" ||
          extension === ".png" ||
          extension === ".gif"
        );
      });

      if (imageFilename) {
        const imagePath = `/assets/pictures/${subdirectory}/${imageFilename}`;
        imagePaths.push(imagePath);
      }
    }
  }

  return {
    props: {
      imagePaths,
    },
  };
}
