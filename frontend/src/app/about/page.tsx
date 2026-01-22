"use client";

export default function AboutPage() {
  const features = [
    { icon: "🎯", label: "Inscription gratuite" },
    { icon: "🔒", label: "Paiement sécurisé" },
    { icon: "✓", label: "Profils vérifiés" },
    { icon: "⚡", label: "Réponse rapide" },
  ];


  return (
    <div className="text-slate-800">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          À propos de ProchePro
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Nous connectons les particuliers avec des prestataires de confiance pour simplifier leur quotidien.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-16 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Notre mission</h2>
          <p className="text-slate-600 leading-relaxed">
            ProchePro est né d&apos;une idée simple : faciliter la mise en relation entre les personnes 
            qui ont besoin d&apos;aide et celles qui peuvent la fournir. Que ce soit pour du bricolage, 
            du ménage, du jardinage ou tout autre service, notre plateforme permet de trouver 
            rapidement un prestataire qualifié près de chez soi.
          </p>
          <p className="text-slate-600 leading-relaxed mt-4">
            Nous croyons en une économie locale et solidaire, où chacun peut proposer ses compétences 
            et gagner un revenu complémentaire tout en rendant service à sa communauté.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow"
            >
              <p className="text-4xl mb-2">{feature.icon}</p>
              <p className="text-sm font-medium text-slate-700">{feature.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Nos valeurs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl mb-4">
              🤝
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Confiance</h3>
            <p className="text-sm text-slate-600">
              La confiance est au cœur de notre plateforme. Chaque prestataire est évalué par la communauté.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center text-2xl mb-4">
              🎯
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Simplicité</h3>
            <p className="text-sm text-slate-600">
              Une interface intuitive pour demander un service ou proposer ses compétences en quelques clics.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl mb-4">
              🌍
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Proximité</h3>
            <p className="text-sm text-slate-600">
              Nous favorisons les échanges locaux pour créer du lien dans votre quartier.
            </p>
          </div>
        </div>
      </section>

      {/* Developed by WebVy Studio */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Développé par</h2>
        <div className="max-w-md mx-auto">
          <a 
            href="https://webvy.online/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:ring-sky-200 transition-all group"
          >
            <div className="mb-6">
              <img 
                src="/WebVy.png" 
                alt="WebVy Studio" 
                className="h-24 w-auto mx-auto transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">WebVy Studio</h3>
            <p className="text-sm text-slate-600 mb-4">
              Agence de développement web spécialisée dans la création de solutions digitales innovantes.
            </p>
            <span className="inline-flex items-center text-sm font-medium text-sky-600 group-hover:text-sky-700">
              Visiter le site
              <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center rounded-2xl bg-slate-900 px-6 py-12 text-white">
        <h2 className="text-2xl font-bold mb-3">Rejoignez l&apos;aventure</h2>
        <p className="text-slate-400 mb-6 max-w-lg mx-auto">
          Que vous soyez à la recherche d&apos;aide ou que vous souhaitiez proposer vos services, 
          ProchePro est fait pour vous.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
          >
            Créer un compte
          </a>
          <a
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Comment ça marche
          </a>
        </div>
      </section>
    </div>
  );
}
