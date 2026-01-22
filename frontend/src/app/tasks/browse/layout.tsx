import { Metadata } from "next";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // searchParams може бути undefined під час static generation
  const category = searchParams?.category as string | undefined;
  const subcategory = searchParams?.subcategory as string | undefined;
  
  // Завантажуємо дані категорії для унікального title
  let categoryName = "";
  let subcategoryName = "";
  
  if (category) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr"}/api/service-categories`);
      if (res.ok) {
        const categories = await res.json();
        const foundCat = categories.find((c: any) => c.key === category);
        if (foundCat) {
          categoryName = foundCat.name;
          if (subcategory && foundCat.subcategories) {
            const foundSub = foundCat.subcategories.find((s: any) => s.key === subcategory);
            if (foundSub) subcategoryName = foundSub.name;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching category metadata:", error);
    }
  }
  
  // Генеруємо унікальні title/description
  let title = "Toutes les annonces de services à domicile";
  let description = "Parcourez toutes les annonces de services à domicile en France. Trouvez des missions près de chez vous.";
  
  if (subcategoryName && categoryName) {
    title = `Annonces ${subcategoryName} - ${categoryName} | ProchePro`;
    description = `Trouvez des missions ${subcategoryName.toLowerCase()} dans la catégorie ${categoryName.toLowerCase()}. Prestataires vérifiés en France.`;
  } else if (categoryName) {
    title = `Annonces ${categoryName} | ProchePro`;
    description = `Découvrez toutes les annonces ${categoryName.toLowerCase()} en France. Missions disponibles pour prestataires vérifiés.`;
  }
  
  // Canonical URL залежить від параметрів
  const canonicalUrl = category 
    ? `https://prochepro.fr/tasks/browse?category=${category}${subcategory ? `&subcategory=${subcategory}` : ''}`
    : "https://prochepro.fr/tasks/browse";
  
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export default function TasksBrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
