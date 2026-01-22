"use client";

export default function PrivacyPage() {
  return (
    <div className="text-slate-800">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-slate-500">
            Dernière mise à jour : 1er janvier 2024
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-slate prose-sm max-w-none">
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100 space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                1. Introduction
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Chez ProchePro, nous accordons une grande importance à la protection de vos données 
                personnelles. Cette politique de confidentialité explique comment nous collectons, 
                utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                2. Données collectées
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Nous collectons différents types de données pour vous fournir nos services :
              </p>
              
              <h3 className="text-base font-medium text-slate-800 mt-4 mb-2">
                2.1 Données d&apos;identification
              </h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Photo de profil (optionnel)</li>
                <li>Adresse postale ou ville</li>
              </ul>

              <h3 className="text-base font-medium text-slate-800 mt-4 mb-2">
                2.2 Données de transaction
              </h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Historique des annonces publiées ou réalisées</li>
                <li>Montants des transactions</li>
                <li>Avis et évaluations</li>
                <li>Messages échangés sur la plateforme</li>
              </ul>

              <h3 className="text-base font-medium text-slate-800 mt-4 mb-2">
                2.3 Données techniques
              </h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Adresse IP</li>
                <li>Type de navigateur et appareil</li>
                <li>Pages visitées et temps passé</li>
                <li>Cookies et technologies similaires</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                3. Utilisation des données
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Faciliter la mise en relation entre Clients et Prestataires</li>
                <li>Traiter les paiements de manière sécurisée</li>
                <li>Vous envoyer des notifications relatives à vos annonces</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
                <li>Prévenir les fraudes et assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                4. Partage des données
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                <li>
                  <strong>Autres utilisateurs :</strong> Votre profil public (nom, photo, avis) 
                  est visible par les autres utilisateurs de la plateforme
                </li>
                <li>
                  <strong>Prestataires de paiement :</strong> Pour traiter vos transactions 
                  de manière sécurisée
                </li>
                <li>
                  <strong>Prestataires techniques :</strong> Hébergement, envoi d&apos;emails, 
                  analyse de données
                </li>
                <li>
                  <strong>Autorités :</strong> En cas d&apos;obligation légale ou de demande 
                  judiciaire
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                5. Sécurité des données
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
                pour protéger vos données :
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Stockage sécurisé des mots de passe (hashage)</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance continue des systèmes</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                6. Conservation des données
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour 
                fournir nos services et respecter nos obligations légales :
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                <li>Données de compte : jusqu&apos;à la suppression du compte + 3 ans</li>
                <li>Données de transaction : 10 ans (obligations comptables)</li>
                <li>Messages : 5 ans après la fin de la mission</li>
                <li>Cookies : 13 mois maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                7. Vos droits
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong>Droit d&apos;accès :</strong> Obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                <li><strong>Droit à l&apos;effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> Limiter le traitement de vos données</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                Pour exercer ces droits, contactez-nous à{" "}
                <a href="mailto:privacy@prochepro.fr" className="text-sky-600 hover:text-sky-700">
                  privacy@prochepro.fr
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                8. Cookies
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. 
                Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres 
                de votre navigateur.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                Types de cookies utilisés :
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
                <li><strong>Essentiels :</strong> Nécessaires au fonctionnement du site</li>
                <li><strong>Analytiques :</strong> Pour comprendre l&apos;utilisation du site</li>
                <li><strong>Fonctionnels :</strong> Pour mémoriser vos préférences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                9. Modifications
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité. En cas de 
                modification importante, nous vous en informerons par email ou via une 
                notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                10. Contact
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Pour toute question concernant cette politique de confidentialité ou vos 
                données personnelles, contactez notre Délégué à la Protection des Données :
              </p>
              <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                <p><strong>ProchePro - DPO</strong></p>
                <p>Email : <a href="mailto:privacy@prochepro.fr" className="text-sky-600">privacy@prochepro.fr</a></p>
              </div>
            </section>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-sky-600 hover:text-sky-700">
            ← Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
