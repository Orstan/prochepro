import { Metadata } from "next";
import { generateLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tous nos services à domicile - Trouvez le bon professionnel",
  description:
    "Découvrez tous les services disponibles sur ProchePro : plomberie, électricité, ménage, jardinage, déménagement, bricolage, cours particuliers et bien plus. Trouvez le professionnel qu'il vous faut.",
  keywords: [
    "services à domicile",
    "catégories services",
    "plombier",
    "électricien",
    "ménage",
    "jardinage",
    "déménagement",
    "bricolage",
    "cours particuliers",
  ],
  openGraph: {
    title: "Tous nos services | ProchePro",
    description:
      "Découvrez tous les services disponibles : plomberie, électricité, ménage, jardinage et plus.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessSchema()),
        }}
      />
      {children}
    </>
  );
}
