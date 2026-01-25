"use client";

import { useParams } from "next/navigation";
import { BLOG_ARTICLES } from "@/lib/blog-articles";
import { PARIS_DISTRICTS, PARIS_SUBURBS, formatLocation, getLocationDetails } from "@/lib/paris-districts";
import Link from "next/link";
import { Calendar, Clock, User, MapPin, ArrowLeft } from "lucide-react";

export default function LocalizedBlogArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const locationSlug = params.location as string;
  
  // Find article
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  
  // Find location
  const district = PARIS_DISTRICTS.find((d) => d.code.toLowerCase() === locationSlug.toLowerCase());
  const suburb = PARIS_SUBURBS.find((s) => s.code.toLowerCase() === locationSlug.toLowerCase());
  const location = district || suburb;
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }
  
  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Localisation non trouvée</h1>
          <Link href={`/blog/${slug}`} className="text-blue-600 hover:underline">
            Voir l'article principal
          </Link>
        </div>
      </div>
    );
  }
  
  const locationName = formatLocation(location.code);
  const locationDetails = getLocationDetails(location.code);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Location */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au blog
          </Link>
          
          <div className="flex items-center gap-2 text-blue-100 mb-4">
            <MapPin className="w-5 h-5" />
            <span className="text-lg font-medium">{locationName}</span>
            {locationDetails?.zone && (
              <>
                <span>•</span>
                <span>{locationDetails.zone}</span>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {article.title.replace(/\d{4}/, `${locationName} $&`)}
          </h1>
          
          <p className="text-xl text-blue-100 mb-6">{article.excerpt}</p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readingTime} min de lecture</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Local Context Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Informations locales pour {locationName}
          </h2>
          <p className="text-gray-700 mb-4">
            Cet article est adapté pour les résidents et professionnels de <strong>{locationName}</strong>.
            {locationDetails?.landmarks && locationDetails.landmarks.length > 0 && (
              <> Quartiers desservis : {locationDetails.landmarks.join(", ")}.</>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/tasks/browse?location=${location.code}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Voir les missions à {locationName}
            </Link>
            <Link
              href={`/prestataires?location=${location.code}`}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Professionnels à {locationName}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-gray-700 prose-li:my-2
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-table:border-collapse prose-table:w-full
              prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold
              prose-td:p-3 prose-td:border prose-td:border-gray-200"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* Local CTA */}
          <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Besoin d'un professionnel à {locationName} ?
            </h3>
            <p className="text-gray-700 mb-4">
              Publiez votre projet gratuitement et recevez des devis de professionnels vérifiés près de chez vous.
            </p>
            <Link
              href="/tasks/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Publier une mission gratuitement
            </Link>
          </div>
        </div>
      </article>
      
      {/* Related Articles for Location */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Plus d'articles pour {locationName}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {BLOG_ARTICLES.filter((a) => a.slug !== slug).slice(0, 4).map((relatedArticle) => (
            <Link
              key={relatedArticle.slug}
              href={`/blog/${relatedArticle.slug}/${location.code.toLowerCase()}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {relatedArticle.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {relatedArticle.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {relatedArticle.readingTime} min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {locationName}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
