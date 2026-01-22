import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Protection de vos données",
  description:
    "Découvrez comment ProchePro protège vos données personnelles. Notre politique de confidentialité explique la collecte, l'utilisation et la protection de vos informations conformément au RGPD.",
  keywords: [
    "politique de confidentialité",
    "RGPD",
    "données personnelles",
    "vie privée",
    "protection des données",
    "cookies",
  ],
  openGraph: {
    title: "Politique de confidentialité | ProchePro",
    description:
      "Découvrez comment nous protégeons vos données personnelles.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
