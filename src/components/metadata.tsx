import Head from "next/head";

export default function Metadata(props: any) {
  return (
    <Head>
      <title>Raphotos | {props.title}</title>
      <meta name="description" content="Raphotos" />
      <link rel="icon" href="favicon.ico" />
    </Head>
  );
}
