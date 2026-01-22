import { Metadata } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

async function getBlogStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts?per_page=1`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.total || 0;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const totalPosts = await getBlogStats();
  
  const title = "Blog ProchePro - Conseils, astuces et actualités services à domicile";
  const description = totalPosts 
    ? `Découvrez ${totalPosts} articles : conseils pratiques, guides de prix et astuces pour vos projets de rénovation, entretien de la maison, jardinage et tous vos besoins en services à domicile.`
    : "Découvrez notre blog : conseils pratiques, guides, astuces pour vos projets de rénovation, entretien de la maison, jardinage et tous vos besoins en services à domicile.";

  return {
    title,
    description,
    keywords: [
      "blog",
      "conseils",
      "astuces",
      "guides",
      "services à domicile",
      "rénovation",
      "bricolage",
      "entretien maison",
      "prix",
      "devis",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      siteName: "ProchePro",
      url: "https://prochepro.fr/blog",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: "https://prochepro.fr/blog",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
