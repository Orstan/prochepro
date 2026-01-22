import { Metadata } from "next";
import { generateLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Trouver un prestataire de services qualifié près de chez vous",
  description:
    "Découvrez des prestataires vérifiés et qualifiés sur ProchePro : plombiers, électriciens, femmes de ménage, jardiniers et plus. Comparez les profils, avis et tarifs avant de choisir.",
  keywords: [
    "prestataires services",
    "professionnels qualifiés",
    "prestataires vérifiés",
    "services à domicile",
    "Paris",
    "Île-de-France",
    "artisans",
  ],
  openGraph: {
    title: "Trouver un prestataire | ProchePro",
    description:
      "Découvrez des prestataires vérifiés et qualifiés. Comparez les profils, avis et tarifs.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrestatairesLayout({
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
