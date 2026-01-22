import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs et forfaits ProchePro - Plans pour prestataires",
  description:
    "Découvrez nos tarifs transparents pour les prestataires : offres gratuites, crédits pour répondre aux annonces, et forfaits premium. Publication d'annonces 100% gratuite pour les clients.",
  keywords: [
    "tarifs",
    "prix",
    "forfaits",
    "abonnement",
    "crédits",
    "gratuit",
    "prestataire",
  ],
  openGraph: {
    title: "Tarifs ProchePro",
    description:
      "Découvrez nos tarifs transparents. Publication gratuite pour les clients.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
