"use client";

export default function TermsPage() {
  return (
    <div className="text-slate-800">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Conditions Générales d&apos;Utilisation
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
                1. Objet
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet de définir 
                les modalités et conditions d&apos;utilisation des services proposés par ProchePro, 
                ainsi que de définir les droits et obligations des parties dans ce cadre.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                ProchePro est une plateforme de mise en relation entre des particuliers (« Clients ») 
                souhaitant faire réaliser des services et des prestataires (« Prestataires ») 
                proposant leurs compétences.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                2. Inscription et compte utilisateur
              </h2>
              <p className="text-slate-600 leading-relaxed">
                L&apos;utilisation de ProchePro nécessite la création d&apos;un compte utilisateur. 
                L&apos;utilisateur s&apos;engage à fournir des informations exactes et à les maintenir à jour.
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                <li>L&apos;utilisateur doit être majeur (18 ans minimum)</li>
                <li>Un seul compte par personne est autorisé</li>
                <li>L&apos;utilisateur est responsable de la confidentialité de ses identifiants</li>
                <li>Toute activité réalisée depuis son compte est sous sa responsabilité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                3. Services proposés
              </h2>
              <p className="text-slate-600 leading-relaxed">
                ProchePro permet aux Clients de publier des demandes de services et aux Prestataires 
                de proposer leurs offres. La plateforme facilite la mise en relation mais n&apos;est 
                pas partie prenante dans la réalisation des services.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                Les services pouvant être proposés incluent notamment : bricolage, ménage, jardinage, 
                déménagement, cours particuliers, garde d&apos;enfants, et tout autre service légal 
                entre particuliers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                4. Obligations des utilisateurs
              </h2>
              <h3 className="text-base font-medium text-slate-800 mt-4 mb-2">
                4.1 Obligations des Clients
              </h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Décrire précisément le service à réaliser</li>
                <li>Respecter les engagements pris avec le Prestataire</li>
                <li>Procéder au paiement selon les modalités convenues</li>
                <li>Laisser un avis honnête après la réalisation de la mission</li>
              </ul>

              <h3 className="text-base font-medium text-slate-800 mt-4 mb-2">
                4.2 Obligations des Prestataires
              </h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Disposer des compétences nécessaires pour réaliser les services proposés</li>
                <li>Respecter les délais et conditions convenus avec le Client</li>
                <li>Être en règle avec la législation applicable (déclaration d&apos;activité, assurances...)</li>
                <li>Fournir un travail de qualité conforme à la description</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                5. Paiements et commissions
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Les paiements sont effectués via la plateforme de manière sécurisée. ProchePro 
                prélève une commission sur chaque transaction réalisée avec succès.
              </p>
              <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                <li>Commission de 15% prélevée sur le montant de la mission</li>
                <li>Paiement sécurisé par carte bancaire</li>
                <li>Fonds conservés jusqu&apos;à validation de la mission par le Client</li>
                <li>Virement au Prestataire sous 3 à 5 jours ouvrés après validation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                6. Responsabilité
              </h2>
              <p className="text-slate-600 leading-relaxed">
                ProchePro agit en tant qu&apos;intermédiaire et ne peut être tenu responsable de la 
                qualité des services fournis par les Prestataires, ni des dommages pouvant résulter 
                de l&apos;exécution des missions.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                Les utilisateurs sont seuls responsables de leurs interactions et des accords 
                conclus entre eux.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                7. Propriété intellectuelle
              </h2>
              <p className="text-slate-600 leading-relaxed">
                L&apos;ensemble des éléments de la plateforme ProchePro (logo, design, textes, 
                fonctionnalités) sont protégés par le droit de la propriété intellectuelle et 
                restent la propriété exclusive de ProchePro.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                8. Modification des CGU
              </h2>
              <p className="text-slate-600 leading-relaxed">
                ProchePro se réserve le droit de modifier les présentes CGU à tout moment. 
                Les utilisateurs seront informés des modifications par email ou notification 
                sur la plateforme. La poursuite de l&apos;utilisation des services vaut acceptation 
                des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                9. Contact
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Pour toute question concernant ces conditions d&apos;utilisation, vous pouvez 
                nous contacter à l&apos;adresse suivante :{" "}
                <a href="mailto:legal@prochepro.fr" className="text-sky-600 hover:text-sky-700">
                  legal@prochepro.fr
                </a>
              </p>
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
