import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment ça marche - Guide complet ProchePro",
  description:
    "Découvrez comment fonctionne ProchePro en 3 étapes simples : publiez votre annonce gratuitement, recevez des offres de prestataires qualifiés, et choisissez le meilleur professionnel.",
  keywords: [
    "comment ça marche",
    "guide",
    "tutoriel",
    "mode d'emploi",
    "étapes",
    "fonctionnement",
  ],
  openGraph: {
    title: "Comment ça marche | ProchePro",
    description:
      "Découvrez comment fonctionne ProchePro en 3 étapes simples.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
