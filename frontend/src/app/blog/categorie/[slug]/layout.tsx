import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

async function getCategoryData(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/category/${slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCategoryData(params.slug);

  if (!data || !data.category) {
    return {
      title: "Catégorie non trouvée | Blog ProchePro",
      description: "La catégorie demandée n'existe pas.",
    };
  }

  const category = data.category;
  const postsCount = data.posts?.total || 0;

  // Use custom SEO fields if available, otherwise auto-generate
  const title = category.meta_title || `${category.name} - Articles et Guides | Blog ProchePro`;
  const description = category.meta_description || `Découvrez ${postsCount} article${postsCount !== 1 ? 's' : ''} sur ${category.name}. Conseils, astuces et guides pratiques pour tous vos projets.`;

  return {
    title,
    description,
    keywords: [
      category.name,
      "blog",
      "conseils",
      "guides",
      "astuces",
      "ProchePro",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      siteName: "ProchePro",
      url: `https://prochepro.fr/blog/categorie/${category.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://prochepro.fr/blog/categorie/${category.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BlogCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
