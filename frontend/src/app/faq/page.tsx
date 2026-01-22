"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const faqs: FAQItem[] = [
    // Général
    {
      category: "general",
      question: "Qu'est-ce que ProchePro ?",
      answer:
        "ProchePro est une plateforme qui met en relation des particuliers ayant besoin d'aide pour des services du quotidien avec des prestataires qualifiés près de chez eux. Que ce soit pour du bricolage, du ménage, du jardinage ou tout autre service, vous trouverez facilement quelqu'un pour vous aider.",
    },
    {
      category: "general",
      question: "ProchePro est-il gratuit ?",
      answer:
        "L'inscription et la publication d'annonces sont entièrement gratuites pour les clients. Les prestataires paient une commission uniquement lorsqu'une mission est réalisée avec succès.",
    },
    {
      category: "general",
      question: "Dans quelles villes ProchePro est-il disponible ?",
      answer:
        "ProchePro est disponible dans toute la France. Nous couvrons les grandes villes comme Paris, Lyon, Marseille, Bordeaux, ainsi que de nombreuses villes moyennes et leurs environs.",
    },
    // Clients
    {
      category: "clients",
      question: "Comment demander un service ?",
      answer:
        "Créez un compte gratuit, cliquez sur 'Demander un service', décrivez votre besoin, fixez votre budget et votre localisation. Les prestataires intéressés vous enverront leurs propositions.",
    },
    {
      category: "clients",
      question: "Comment choisir un prestataire ?",
      answer:
        "Consultez les profils des prestataires qui vous ont fait une offre, regardez leurs avis et notes laissés par d'autres clients, puis choisissez celui qui correspond le mieux à vos attentes et votre budget.",
    },
    {
      category: "clients",
      question: "Que faire si je ne suis pas satisfait du travail ?",
      answer:
        "Si le travail ne correspond pas à ce qui était convenu, contactez d'abord le prestataire pour trouver une solution. Si le problème persiste, notre service client est là pour vous aider à résoudre le litige.",
    },
    // Prestataires
    {
      category: "prestataires",
      question: "Comment devenir prestataire ?",
      answer:
        "Inscrivez-vous en tant que prestataire, complétez votre profil avec vos compétences et votre expérience, puis commencez à répondre aux annonces qui vous intéressent.",
    },
    {
      category: "prestataires",
      question: "Quelle commission ProchePro prélève-t-il ?",
      answer:
        "ProchePro prélève une commission de 15% sur le montant de chaque mission réalisée. Cette commission couvre les frais de plateforme, le support client et la garantie de paiement.",
    },
    {
      category: "prestataires",
      question: "Comment recevoir mes paiements ?",
      answer:
        "Une fois la mission validée par le client, le paiement est transféré sur votre compte bancaire sous 3 à 5 jours ouvrés. Vous pouvez suivre vos revenus dans votre tableau de bord.",
    },
    // Paiement & Sécurité
    {
      category: "paiement",
      question: "Comment fonctionne le paiement sécurisé ?",
      answer:
        "Le client effectue le paiement lors de l'acceptation d'une offre. L'argent est conservé de manière sécurisée jusqu'à la validation de la mission. Une fois le travail terminé et validé, le prestataire reçoit son paiement.",
    },
    {
      category: "paiement",
      question: "Quels moyens de paiement sont acceptés ?",
      answer:
        "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) ainsi que les virements bancaires pour les montants importants.",
    },
    {
      category: "paiement",
      question: "Mes données sont-elles sécurisées ?",
      answer:
        "Oui, nous utilisons un cryptage SSL pour protéger toutes vos données. Vos informations bancaires ne sont jamais stockées sur nos serveurs et sont traitées par des prestataires de paiement certifiés PCI-DSS.",
    },
  ];

  const categories = [
    { id: "all", label: "Toutes les questions" },
    { id: "general", label: "Général" },
    { id: "clients", label: "Pour les clients" },
    { id: "prestataires", label: "Pour les prestataires" },
    { id: "paiement", label: "Paiement & Sécurité" },
  ];

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="text-slate-800">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Foire aux questions
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Trouvez rapidement les réponses à vos questions les plus fréquentes.
        </p>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-sky-500 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-sky-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ List */}
      <section className="mb-16">
        <div className="space-y-3 max-w-3xl mx-auto">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center rounded-2xl bg-slate-50 px-6 py-10 ring-1 ring-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Vous n&apos;avez pas trouvé votre réponse ?
        </h2>
        <p className="text-slate-600 mb-6">
          Notre équipe est disponible pour répondre à toutes vos questions.
        </p>
        <a
          href="/help"
          className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
        >
          Contacter le support
        </a>
      </section>
    </div>
  );
}
