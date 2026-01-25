import { Metadata } from "next";
import { getServiceBySlug } from "@/lib/services-seo";
import { CITIES_WITH_REGIONS } from "@/lib/cities";

interface Props {
  params: { service: string; city: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const service = getServiceBySlug(resolvedParams.service);
  const cityName = decodeURIComponent(resolvedParams.city).replace(/-/g, " ");
  const cityInfo = CITIES_WITH_REGIONS.find(
    c => c.city.toLowerCase() === cityName.toLowerCase()
  );

  if (!service) {
    return {
      title: "Service non trouvé | ProchePro",
    };
  }

  const title = `${service.name} ${cityName} - Tarifs, Avis et Devis Gratuit | ProchePro`;
  const description = `Trouvez un ${service.name.toLowerCase()} à ${cityName} (${cityInfo?.region || "Île-de-France"}). ${service.description} Comparez les prix (${service.priceRange}) et obtenez des devis gratuits !`;

  return {
    title,
    description,
    keywords: [
      `${service.name.toLowerCase()} ${cityName}`,
      `${service.name.toLowerCase()} pas cher ${cityName}`,
      `${service.name.toLowerCase()} avis ${cityName}`,
      `tarif ${service.name.toLowerCase()} ${cityName}`,
      `prix ${service.name.toLowerCase()} ${cityName}`,
      ...service.keywords.map(k => `${k} ${cityName}`),
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      siteName: "ProchePro",
      url: `https://prochepro.fr/services/${resolvedParams.service}/${resolvedParams.city}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://prochepro.fr/services/${resolvedParams.service}/${resolvedParams.city}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ServiceCityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
