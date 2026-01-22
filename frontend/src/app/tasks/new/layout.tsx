import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer une nouvelle annonce de service",
  description:
    "Publiez gratuitement votre annonce de service sur ProchePro. Décrivez votre besoin et recevez rapidement des offres de prestataires qualifiés près de chez vous.",
  keywords: [
    "publier annonce",
    "créer annonce",
    "demande service",
    "trouver prestataire",
    "service à domicile",
    "gratuit",
  ],
  openGraph: {
    title: "Créer une annonce | ProchePro",
    description:
      "Publiez gratuitement votre annonce et recevez des offres de prestataires qualifiés.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TasksNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
