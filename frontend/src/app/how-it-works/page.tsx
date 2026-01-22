"use client";

import { useState } from "react";

export default function HowItWorksPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Prepare WhatsApp message
    const whatsappMessage = `*Nouveau message de contact ProchePro*\n\n*Nom:* ${formData.name}\n*Email:* ${formData.email}\n*Sujet:* ${formData.subject}\n\n*Message:*\n${formData.message}`;
    
    const whatsappUrl = `https://wa.me/33605555869?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    setSuccess(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  }

  const steps = [
    {
      number: "01",
      title: "Décrivez votre besoin",
      description:
        "Publiez gratuitement votre annonce en quelques clics. Décrivez ce dont vous avez besoin, fixez votre budget et choisissez votre ville.",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Recevez des offres",
      description:
        "Les prestataires qualifiés près de chez vous vous envoient leurs propositions avec leur tarif et leur disponibilité.",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Choisissez le meilleur",
      description:
        "Comparez les profils, consultez les avis et choisissez le prestataire qui correspond le mieux à vos attentes.",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Mission accomplie",
      description:
        "Une fois la mission terminée, validez le travail et laissez un avis pour aider la communauté.",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  const benefits = [
    {
      title: "100% Gratuit pour les clients",
      description: "Publiez vos annonces sans frais. Seuls les prestataires paient une commission sur les missions réalisées.",
      icon: "💰",
    },
    {
      title: "Prestataires vérifiés",
      description: "Tous nos prestataires sont évalués par la communauté. Consultez leurs avis avant de faire votre choix.",
      icon: "✅",
    },
    {
      title: "Paiement sécurisé",
      description: "Votre paiement est sécurisé et n'est libéré qu'une fois la mission validée par vos soins.",
      icon: "🔒",
    },
    {
      title: "Support réactif",
      description: "Notre équipe est disponible pour vous accompagner à chaque étape de votre projet.",
      icon: "💬",
    },
  ];

  return (
    <div className="text-slate-800">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Comment ça marche ?
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          ProchePro connecte les particuliers avec des prestataires de confiance près de chez eux. 
          Simple, rapide et sécurisé.
        </p>
      </section>

      {/* Steps */}
      <section className="mb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  {step.icon}
                </div>
                <span className="text-3xl font-bold text-slate-200">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-slate-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Pourquoi choisir ProchePro ?
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold md:text-3xl text-slate-900 mb-3">
            Questions fréquentes
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Trouvez rapidement des réponses à vos questions.
          </p>
          
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Rechercher une question... (ex: paiement, sécurisé)"
                className="w-full px-5 py-3 pl-12 rounded-full border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {[
            {
              q: "ProchePro est-il gratuit ?",
              a: "Oui ! L'inscription et la publication d'annonces sont 100% gratuites pour les clients. Pour les prestataires : paiements en ligne 0% pour les 3 premières missions puis 10%, paiements en espèces 15% dès la 1ère mission.",
              keywords: "gratuit prix tarif inscription commission espèces carte"
            },
            {
              q: "Comment fonctionne le paiement sécurisé ?",
              a: "Le client effectue le paiement lors de l'acceptation d'une offre. L'argent est conservé de manière sécurisée jusqu'à la validation de la mission. Le prestataire reçoit son paiement après validation.",
              keywords: "paiement sécurisé argent garantie"
            },
            {
              q: "Comment choisir un prestataire ?",
              a: "Consultez les profils des prestataires, regardez leurs avis et notes laissés par d'autres clients, puis choisissez celui qui correspond le mieux à vos attentes.",
              keywords: "choisir prestataire avis profil"
            },
            {
              q: "Que faire si je ne suis pas satisfait ?",
              a: "Si le travail ne correspond pas à ce qui était convenu, contactez d'abord le prestataire. Si le problème persiste, notre service client est là pour vous aider.",
              keywords: "problème insatisfait litige support"
            }
          ].filter(item => {
            if (!faqSearch) return true;
            const searchLower = faqSearch.toLowerCase();
            return item.q.toLowerCase().includes(searchLower) || 
                   item.a.toLowerCase().includes(searchLower) ||
                   item.keywords.toLowerCase().includes(searchLower);
          }).map((faq, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                <span className={`text-2xl text-sky-500 transition-transform duration-300 flex-shrink-0 ${
                  expandedFaq === index ? 'rotate-180' : ''
                }`}>▼</span>
              </button>
              {expandedFaq === index && (
                <div className="px-6 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Besoin d&apos;aide ? Contactez-nous
            </h2>
            <p className="text-slate-600">
              Notre équipe est là pour répondre à toutes vos questions.
            </p>
          </div>

          {success ? (
            <div className="text-center py-12 rounded-2xl border border-emerald-200 bg-emerald-50">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
              <p className="text-slate-600 mb-4">
                Votre message a été envoyé sur WhatsApp. Nous vous répondrons rapidement.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">Informations de contact</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sky-100">info@prochepro.fr</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sky-100">+33 6 05 55 58 69</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <p className="font-medium">Horaires</p>
                        <p className="text-sky-100">Lun - Ven : 9h - 18h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="jean@exemple.fr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Sujet *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="Question générale">Question générale</option>
                      <option value="Signaler un problème">Signaler un problème</option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Partenariat">Partenariat</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                      placeholder="Décrivez votre demande..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? "Envoi..." : (
                      <>
                        <span>Envoyer sur WhatsApp</span>
                        <span>💬</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-12 text-white">
        <h2 className="text-2xl font-bold mb-3">Prêt à commencer ?</h2>
        <p className="text-sky-100 mb-6 max-w-lg mx-auto">
          Rejoignez des milliers d&apos;utilisateurs qui font confiance à ProchePro pour leurs projets du quotidien.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/tasks/new"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-600 shadow-sm hover:bg-sky-50"
          >
            Demander un service gratuitement
          </a>
          <a
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Devenir prestataire
          </a>
        </div>
      </section>
    </div>
  );
}
