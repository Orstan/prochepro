import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forum communautaire - Échangez avec prestataires et clients",
  description:
    "Rejoignez la communauté ProchePro : posez vos questions, partagez vos expériences, obtenez des conseils de professionnels et d'autres utilisateurs. Forum d'entraide gratuit.",
  keywords: [
    "forum",
    "communauté",
    "discussion",
    "questions",
    "entraide",
    "conseils",
    "expériences",
  ],
  openGraph: {
    title: "Forum communautaire | ProchePro",
    description:
      "Rejoignez la communauté : posez vos questions, partagez vos expériences.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
