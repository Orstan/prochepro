import { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

const API_BASE_URL = "https://api.prochepro.fr";

async function getArticleData(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts/${slug}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Blog API error: ${res.status} for ${slug}`);
      return null;
    }
    
    const article = await res.json();
    console.log(`Blog article ${slug}:`, article ? 'found' : 'not found');
    return article;
  } catch (error) {
    console.error(`Blog fetch error:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleData(resolvedParams.slug);

  if (!article) {
    return {
      title: "Article non trouvé | Blog ProchePro",
      description: "L'article demandé n'existe pas.",
    };
  }

  // Use custom SEO fields if available, otherwise auto-generate
  const title = article.meta_title || `${article.title} | Blog ProchePro`;
  const description = article.meta_description || article.excerpt || article.title;

  return {
    title,
    description,
    keywords: article.keywords || [],
    authors: article.author ? [{ name: article.author.name }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "fr_FR",
      siteName: "ProchePro",
      url: `https://prochepro.fr/blog/${article.slug}`,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: article.author ? [article.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://prochepro.fr/blog/${article.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BlogArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
