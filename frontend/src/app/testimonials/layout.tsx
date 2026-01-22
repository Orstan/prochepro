import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Témoignages clients - Avis vérifiés sur nos services",
  description:
    "Découvrez les témoignages authentiques de nos clients satisfaits. Avis vérifiés, retours d'expérience et notes des prestataires sur ProchePro.",
  keywords: [
    "témoignages",
    "avis clients",
    "retours d'expérience",
    "satisfaction",
    "notes",
    "évaluations",
  ],
  openGraph: {
    title: "Témoignages clients | ProchePro",
    description:
      "Découvrez les témoignages authentiques de nos clients satisfaits.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
