import { Metadata } from "next";
import { generateFAQSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Centre d'aide",
  description:
    "Trouvez des réponses à toutes vos questions sur ProchePro. Comment ça marche, tarifs, sécurité, et plus. Notre équipe est là pour vous aider.",
  keywords: [
    "aide",
    "FAQ",
    "questions fréquentes",
    "comment ça marche",
    "support",
    "contact",
  ],
  openGraph: {
    title: "Centre d'aide | ProchePro",
    description:
      "Trouvez des réponses à toutes vos questions sur ProchePro.",
  },
};

const faqs = [
  {
    question: "Comment fonctionne ProchePro ?",
    answer:
      "ProchePro est une plateforme qui met en relation des particuliers avec des prestataires de services de confiance. Publiez votre demande gratuitement, recevez des offres de professionnels près de chez vous, et choisissez le meilleur prestataire.",
  },
  {
    question: "Est-ce gratuit de publier une annonce ?",
    answer:
      "Oui, c'est 100% gratuit pour les clients ! Vous pouvez publier autant d'annonces que vous le souhaitez sans aucun frais.",
  },
  {
    question: "Comment devenir prestataire sur ProchePro ?",
    answer:
      "Inscrivez-vous gratuitement en tant que prestataire, complétez votre profil, et commencez à envoyer des offres sur les annonces qui vous intéressent.",
  },
  {
    question: "Comment sont vérifiés les prestataires ?",
    answer:
      "Tous les prestataires sont évalués par la communauté après chaque mission. Vous pouvez consulter leurs avis et notes.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes bancaires (Visa, Mastercard) via notre partenaire de paiement sécurisé Stripe.",
  },
  {
    question: "Comment contacter le support ?",
    answer:
      "Vous pouvez nous contacter via le formulaire de contact ou par email à info@prochepro.fr.",
  },
];

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
      {children}
    </>
  );
}
