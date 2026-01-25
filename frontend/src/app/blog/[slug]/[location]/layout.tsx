import { Metadata } from "next";
import { BLOG_ARTICLES } from "@/lib/blog-articles";
import { PARIS_DISTRICTS, PARIS_SUBURBS, formatLocation } from "@/lib/paris-districts";

interface Props {
  params: Promise<{
    slug: string;
    location: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, location: locationSlug } = await params;
  
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  const district = PARIS_DISTRICTS.find((d) => d.code.toLowerCase() === locationSlug.toLowerCase());
  const suburb = PARIS_SUBURBS.find((s) => s.code.toLowerCase() === locationSlug.toLowerCase());
  const location = district || suburb;
  
  if (!article || !location) {
    return {
      title: "Article non trouvé | ProchePro",
      description: "L'article demandé n'existe pas.",
    };
  }
  
  const locationName = formatLocation(location.code);
  
  // Generate localized title
  const localizedTitle = `${article.title.replace(/\d{4}/, "")} ${locationName} 2026`;
  const localizedMetaTitle = `${article.metaTitle.replace(/\d{4}/, "")} ${locationName}`;
  const localizedDescription = article.metaDescription.replace(
    /(près de chez vous|dans votre région)/gi,
    `à ${locationName}`
  );
  
  // Add location-specific keywords
  const localKeywords = [
    ...article.keywords,
    `${locationName.toLowerCase()}`,
    `${article.category} ${locationName.toLowerCase()}`,
  ];
  
  return {
    title: localizedMetaTitle,
    description: localizedDescription,
    keywords: localKeywords,
    openGraph: {
      title: localizedTitle,
      description: localizedDescription,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: localKeywords,
    },
    twitter: {
      card: "summary_large_image",
      title: localizedTitle,
      description: localizedDescription,
    },
    alternates: {
      canonical: `https://prochepro.fr/blog/${slug}/${locationSlug.toLowerCase()}`,
    },
  };
}

export default function LocalizedBlogArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
