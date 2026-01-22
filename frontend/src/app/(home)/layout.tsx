import { generateFAQSchema } from "@/lib/seo";

const faqs = [
  {
    question: "Comment fonctionne ProchePro ?",
    answer:
      "ProchePro est une plateforme qui met en relation des particuliers avec des prestataires de services de confiance. Publiez votre demande gratuitement, recevez des offres de professionnels près de chez vous, et choisissez le meilleur prestataire.",
  },
  {
    question: "Est-ce gratuit de publier une annonce ?",
    answer:
      "Oui, c'est 100% gratuit pour les clients ! Vous pouvez publier autant d'annonces que vous le souhaitez sans aucun frais. Seuls les prestataires paient pour envoyer des offres.",
  },
  {
    question: "Comment sont vérifiés les prestataires ?",
    answer:
      "Tous les prestataires sont évalués par la communauté après chaque mission. Vous pouvez consulter leurs avis, notes et historique avant de faire votre choix.",
  },
  {
    question: "Quels types de services puis-je trouver ?",
    answer:
      "ProchePro propose tous types de services à domicile : plomberie, électricité, ménage, jardinage, déménagement, bricolage, cours particuliers, garde d'enfants, et bien plus encore.",
  },
  {
    question: "Comment payer un prestataire ?",
    answer:
      "Le paiement se fait directement entre vous et le prestataire, après validation du travail effectué. ProchePro ne prélève aucune commission sur les transactions.",
  },
  {
    question: "Que faire en cas de problème avec un prestataire ?",
    answer:
      "Notre service client est disponible pour vous aider en cas de litige. Vous pouvez également laisser un avis pour informer la communauté.",
  },
];

export default function HomeLayout({
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
