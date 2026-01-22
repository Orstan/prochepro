import { Metadata } from "next";

const SITE_URL = "https://prochepro.fr";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/api/tasks/${params.id}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) {
      return {
        title: "Annonce non trouvée",
        description: "Cette annonce n'existe pas ou a été supprimée.",
      };
    }

    const task = await res.json();

    const title = task.title || "Annonce de service";
    const description = task.description
      ? task.description.slice(0, 160)
      : `Annonce de service à ${task.city || "domicile"}. Budget: ${
          task.budget_min ? `${task.budget_min}€` : "À négocier"
        }${task.budget_max ? ` - ${task.budget_max}€` : ""}`;

    return {
      title: `${title} - ${task.city || "France"}`,
      description,
      keywords: [
        task.category || "services",
        task.city || "France",
        "annonce",
        "service à domicile",
        "prestataire",
      ],
      openGraph: {
        title: `${title} | ProchePro`,
        description,
        url: `${SITE_URL}/tasks/${params.id}`,
        type: "article",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
      alternates: {
        canonical: `${SITE_URL}/tasks/${params.id}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Annonce de service",
      description: "Consultez cette annonce de service à domicile sur ProchePro.",
    };
  }
}

export default function TaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
