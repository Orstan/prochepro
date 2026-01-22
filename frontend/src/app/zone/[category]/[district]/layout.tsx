import { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface Props {
  params: { category: string; district: string };
}

const API_BASE_URL = "https://api.prochepro.fr";

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
  const resolvedParams = await params;
  const data = await getLocalSeoData(resolvedParams.category, resolvedParams.district);

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
      canonical: `https://prochepro.fr/zone/${resolvedParams.category}/${resolvedParams.district}`,
    },
  };
}

export default function LocalSeoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
