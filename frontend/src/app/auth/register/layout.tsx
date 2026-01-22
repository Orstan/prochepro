import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription gratuite",
  description:
    "Créez votre compte ProchePro gratuitement. Trouvez des prestataires de confiance ou proposez vos services à domicile partout en France.",
  keywords: [
    "inscription",
    "créer compte",
    "devenir prestataire",
    "services à domicile",
    "France",
  ],
  openGraph: {
    title: "Inscription gratuite | ProchePro",
    description:
      "Créez votre compte ProchePro gratuitement et commencez à trouver des services à domicile.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
