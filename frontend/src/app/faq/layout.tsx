import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Questions fréquentes sur ProchePro",
  description:
    "Trouvez des réponses aux questions les plus fréquentes sur ProchePro : comment publier une annonce, trouver un prestataire, paiement, sécurité, tarifs et plus encore.",
  keywords: [
    "FAQ",
    "questions fréquentes",
    "aide",
    "comment ça marche",
    "tarifs",
    "paiement",
    "sécurité",
  ],
  openGraph: {
    title: "Questions fréquentes | ProchePro",
    description:
      "Trouvez des réponses aux questions les plus fréquentes sur ProchePro.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
