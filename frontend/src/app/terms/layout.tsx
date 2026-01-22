import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation - Règles de la plateforme",
  description:
    "Lisez les conditions générales d'utilisation de ProchePro : droits et obligations des utilisateurs, règles de la plateforme, paiements, litiges et mentions légales.",
  keywords: [
    "CGU",
    "conditions générales",
    "mentions légales",
    "règles",
    "obligations",
    "droits",
  ],
  openGraph: {
    title: "Conditions générales | ProchePro",
    description:
      "Droits et obligations des utilisateurs, règles de la plateforme.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
