import { Metadata } from "next";
import Link from "next/link";
import { sanitizeHtml } from "@/lib/sanitize";

const API_BASE_URL = "https://api.prochepro.fr";

interface LocalSeoPage {
  id: number;
  title: string;
  meta_title?: string;
  meta_description?: string;
  content: string;
  keywords?: string[];
  service_category?: string;
  service_subcategory?: string;
}

interface Props {
  params: { category: string; district: string };
}

async function getLocalSeoData(category: string, district: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/local-pages/district/${district}/service/${category}`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.page || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getLocalSeoData(params.category, params.district);

  if (!data) {
    return {
      title: "Service non trouvé | ProchePro",
      description: "Ce service n'existe pas dans cette zone.",
    };
  }

  return {
    title: data.meta_title || data.title || "ProchePro",
    description: data.meta_description || data.content?.substring(0, 160) || "",
    keywords: data.keywords || [],
    openGraph: {
      title: data.meta_title || data.title || "ProchePro",
      description: data.meta_description || data.content?.substring(0, 160) || "",
      type: "website",
      locale: "fr_FR",
      siteName: "ProchePro",
    },
    alternates: {
      canonical: `https://prochepro.fr/zone/${params.category}/${params.district}`,
    },
  };
}

export default async function LocalSeoPage({ params }: Props) {
  const page = await getLocalSeoData(params.category, params.district);

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Service non trouvé</h1>
          <p className="text-slate-600 mb-8">Ce service n'existe pas dans cette zone.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-white hover:bg-sky-600"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <article className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{page.title}</h1>
          {page.meta_description && (
            <p className="text-lg text-slate-600 mb-8">{page.meta_description}</p>
          )}
          
          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />

          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link
              href={`/tasks/new?category=${params.category}`}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-8 py-3 text-white font-semibold hover:bg-sky-600"
            >
              Publier une demande
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
