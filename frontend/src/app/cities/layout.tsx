import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Villes desservies - Services à domicile partout en France",
  description:
    "Trouvez des services à domicile dans toutes les villes de France : Paris et tous ses arrondissements, Île-de-France et grandes villes. ProchePro connecte particuliers et prestataires locaux.",
  keywords: [
    "villes",
    "Paris",
    "arrondissements",
    "Île-de-France",
    "services locaux",
    "partout en France",
  ],
  openGraph: {
    title: "Villes desservies | ProchePro",
    description:
      "Trouvez des services à domicile dans toutes les villes de France.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
