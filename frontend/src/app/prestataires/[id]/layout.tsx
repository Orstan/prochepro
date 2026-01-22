import { Metadata } from "next";

export const dynamic = 'force-dynamic';

const SITE_URL = "https://prochepro.fr";
const API_URL = "https://api.prochepro.fr";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const res = await fetch(`${API_URL}/api/prestataires/${resolvedParams.id}/profile`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`Prestataire API error: ${res.status} for ID ${resolvedParams.id}`);
      return {
        title: "Prestataire non trouvé",
        description: "Ce profil de prestataire n'existe pas.",
      };
    }

    const data = await res.json();
    const prestataire = data.user || data;
    console.log(`Prestataire ${resolvedParams.id}:`, prestataire.name || 'no name');

    const name = prestataire.name || "Prestataire";
    const city = prestataire.city || "France";
    const bio = prestataire.bio || "";
    const categories = prestataire.service_categories || [];
    const rating = prestataire.average_rating || null;
    const reviewsCount = prestataire.reviews_count || 0;

    const title = `${name} - Prestataire de services à ${city}`;
    const description = bio
      ? bio.slice(0, 160)
      : `Découvrez le profil de ${name}, prestataire de services à ${city}. ${
          rating ? `Note: ${rating}/5 (${reviewsCount} avis).` : ""
        } ${categories.slice(0, 3).join(", ")}.`;

    return {
      title,
      description,
      keywords: [
        name,
        "prestataire",
        city,
        ...categories,
        "services à domicile",
        "profil vérifié",
      ],
      openGraph: {
        title: `${name} | ProchePro`,
        description,
        url: `${SITE_URL}/prestataires/${resolvedParams.id}`,
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: name,
        description,
      },
      alternates: {
        canonical: `${SITE_URL}/prestataires/${resolvedParams.id}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Profil prestataire",
      description: "Consultez ce profil de prestataire sur ProchePro.",
    };
  }
}

export default function PrestataireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
