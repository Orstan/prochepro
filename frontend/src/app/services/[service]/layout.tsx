import { Metadata } from "next";
import { getServiceBySlug } from "@/lib/services-seo";

interface Props {
  params: { service: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const service = getServiceBySlug(resolvedParams.service);

  if (!service) {
    return {
      title: "Service non trouvé | ProchePro",
      description: "Ce service n'existe pas sur ProchePro.",
    };
  }

  const title = `${service.name} en Île-de-France - Devis Gratuit & Comparateur de Prix 2026`;
  const description = `Trouvez un ${service.name.toLowerCase()} qualifié en Île-de-France. ${service.description} Prix moyen : ${service.priceRange}. Comparez les devis gratuits de professionnels près de chez vous !`;

  return {
    title,
    description,
    keywords: [
      service.name.toLowerCase(),
      `${service.name.toLowerCase()} ile de france`,
      `prix ${service.name.toLowerCase()}`,
      `tarif ${service.name.toLowerCase()}`,
      `devis ${service.name.toLowerCase()}`,
      `${service.name.toLowerCase()} pas cher`,
      `avis ${service.name.toLowerCase()}`,
      ...service.keywords,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      siteName: "ProchePro",
      url: `https://prochepro.fr/services/${resolvedParams.service}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://prochepro.fr/services/${resolvedParams.service}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
