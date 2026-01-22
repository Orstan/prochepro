import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contactez-nous - Support et assistance ProchePro",
  description:
    "Besoin d'aide ? Contactez l'équipe ProchePro. Notre support client est disponible pour répondre à toutes vos questions sur nos services, votre compte ou vos annonces.",
  keywords: [
    "contact",
    "support",
    "aide",
    "assistance",
    "service client",
    "nous contacter",
    "email",
  ],
  openGraph: {
    title: "Contactez-nous | ProchePro",
    description:
      "Notre support client est disponible pour répondre à toutes vos questions.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
