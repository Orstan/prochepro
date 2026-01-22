import { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos de ProchePro - Notre mission et nos valeurs",
  description:
    "ProchePro est la plateforme de confiance pour trouver des services de qualité près de chez vous. Découvrez notre mission : connecter les particuliers avec les meilleurs prestataires locaux.",
  keywords: [
    "à propos",
    "ProchePro",
    "mission",
    "valeurs",
    "plateforme services",
    "qui sommes-nous",
    "équipe",
  ],
  openGraph: {
    title: "À propos de ProchePro",
    description:
      "Découvrez notre mission : connecter les particuliers avec les meilleurs prestataires locaux.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
