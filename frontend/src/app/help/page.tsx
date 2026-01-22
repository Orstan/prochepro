"use client";

import { FormEvent, useState } from "react";

export default function HelpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const helpTopics = [
    {
      icon: "📝",
      title: "Demander un service",
      description: "Apprenez à créer et gérer vos annonces de services.",
      link: "/faq?category=clients",
    },
    {
      icon: "💼",
      title: "Devenir prestataire",
      description: "Découvrez comment proposer vos services sur ProchePro.",
      link: "/faq?category=prestataires",
    },
    {
      icon: "💳",
      title: "Paiements",
      description: "Tout savoir sur les paiements et la facturation.",
      link: "/faq?category=paiement",
    },
    {
      icon: "🔒",
      title: "Sécurité du compte",
      description: "Protégez votre compte et vos données personnelles.",
      link: "/faq?category=paiement",
    },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div className="text-slate-800">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Centre d&apos;aide
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Comment pouvons-nous vous aider aujourd&apos;hui ?
        </p>
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {helpTopics.map((topic) => (
            <a
              key={topic.title}
              href={topic.link}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:ring-sky-200 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-3">{topic.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1">{topic.title}</h3>
              <p className="text-sm text-slate-600">{topic.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ Link */}
      <section className="mb-12 rounded-2xl bg-sky-50 p-6 ring-1 ring-sky-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Consultez notre FAQ
            </h2>
            <p className="text-sm text-slate-600">
              Trouvez rapidement les réponses aux questions les plus fréquentes.
            </p>
          </div>
          <a
            href="/faq"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 shrink-0"
          >
            Voir la FAQ
          </a>
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-2xl mx-auto">
        <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Contactez-nous
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Vous n&apos;avez pas trouvé ce que vous cherchiez ? Envoyez-nous un message.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Message envoyé !
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Nous vous répondrons dans les plus brefs délais.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setSubject("");
                  setMessage("");
                }}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sujet
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="account">Mon compte</option>
                  <option value="task">Une annonce</option>
                  <option value="payment">Paiement</option>
                  <option value="technical">Problème technique</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Décrivez votre problème ou votre question..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-60"
              >
                {submitting ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Contact Info */}
      <section className="mt-12 text-center">
        <p className="text-sm text-slate-500">
          Vous pouvez également nous contacter par email à{" "}
          <a href="mailto:info@prochepro.fr" className="text-sky-600 hover:text-sky-700">
            info@prochepro.fr
          </a>
        </p>
      </section>
    </div>
  );
}
