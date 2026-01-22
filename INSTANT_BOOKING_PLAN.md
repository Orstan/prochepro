# 🚀 Instant Booking System - Plan d'implémentation

## 📋 Vue d'ensemble

Le système **Instant Booking** est une fonctionnalité **additionnelle** qui coexiste avec le système d'offres existant. Les clients peuvent choisir :

1. **📝 Publier une annonce** (système existant) - Pour projets complexes, devis personnalisés
2. **⚡ Réserver maintenant** (nouveau système) - Pour services simples à prix fixe

---

## ✅ Réalisé jusqu'à présent

### Backend Structure:
- ✅ Migration `2026_01_15_200000_create_instant_booking_tables.php`
  - `service_fixed_prices` - Prix fixes pour services
  - `prestataire_availability` - Calendrier de disponibilité
  - `instant_bookings` - Réservations instantanées
  - `instant_booking_payments` - Paiements
  - `prestataire_instant_booking_settings` - Paramètres prestataire

### Models:
- ✅ `InstantBooking` - Réservation instantanée
- ✅ `ServiceFixedPrice` - Service à prix fixe
- ✅ `PrestataireAvailability` - Créneaux de disponibilité
- ✅ `PrestataireInstantBookingSetting` - Paramètres
- ✅ `InstantBookingPayment` - Paiement
- ✅ Relationships ajoutés au modèle `User`

---

## 📝 À implémenter

### 1. Backend API Controllers

#### `InstantBookingController.php`
```php
POST   /api/instant-bookings              # Créer réservation
GET    /api/instant-bookings              # Liste réservations (client/prestataire)
GET    /api/instant-bookings/{id}         # Détails réservation
PUT    /api/instant-bookings/{id}/cancel  # Annuler réservation
PUT    /api/instant-bookings/{id}/confirm # Confirmer (prestataire)
PUT    /api/instant-bookings/{id}/start   # Démarrer travail
PUT    /api/instant-bookings/{id}/complete # Terminer travail
```

#### `ServiceFixedPriceController.php`
```php
GET    /api/service-fixed-prices                    # Liste services disponibles
GET    /api/service-fixed-prices/category/{slug}    # Par catégorie
POST   /api/prestataire/service-fixed-prices        # Créer service (prestataire)
PUT    /api/prestataire/service-fixed-prices/{id}   # Modifier
DELETE /api/prestataire/service-fixed-prices/{id}   # Supprimer
```

#### `PrestataireAvailabilityController.php`
```php
GET    /api/prestataire/{id}/availability           # Voir disponibilité
POST   /api/prestataire/availability/generate       # Générer créneaux automatiques
PUT    /api/prestataire/availability/{id}           # Modifier créneau
DELETE /api/prestataire/availability/{id}           # Bloquer créneau
```

#### `InstantBookingSettingsController.php`
```php
GET    /api/prestataire/instant-booking-settings    # Voir paramètres
PUT    /api/prestataire/instant-booking-settings    # Modifier paramètres
POST   /api/prestataire/instant-booking/enable      # Activer instant booking
POST   /api/prestataire/instant-booking/disable     # Désactiver
```

---

### 2. Frontend - Pages Client

#### `/services/[category]/instant-booking` (NOUVEAU)
**Fonctionnalité:** Liste des prestataires disponibles avec instant booking

```tsx
Components:
- PrestataireCard (avec prix fixes, rating, dispo aujourd'hui)
- FilterSidebar (prix, rating, distance, disponibilité)
- MapView (carte avec prestataires)
```

**Flow:**
1. Client choisit catégorie (ex: Plomberie)
2. Voit liste prestataires avec instant booking activé
3. Filtre par prix, rating, distance, disponibilité
4. Clique "Réserver maintenant"

#### `/instant-booking/[prestataireId]/[serviceId]` (NOUVEAU)
**Fonctionnalité:** Page de réservation

```tsx
Components:
- ServiceDetails (nom, description, prix, durée)
- CalendarPicker (sélection date + heure)
- AddressForm (adresse intervention)
- OrderSummary (récapitulatif)
- PaymentForm (Stripe)
```

**Flow:**
1. Client voit détails du service
2. Sélectionne date et heure disponible
3. Saisit adresse
4. Paie avec Stripe
5. Confirmation instantanée

#### `/client/instant-bookings` (NOUVEAU)
**Fonctionnalité:** Liste des réservations instantanées du client

```tsx
Tabs:
- À venir (upcoming)
- En cours (in_progress)
- Terminées (completed)
- Annulées (cancelled)

Actions:
- Voir détails
- Annuler (si > 2h avant)
- Contacter prestataire
- Laisser avis (après completion)
```

---

### 3. Frontend - Dashboard Prestataire

#### `/prestataire/instant-booking/settings` (NOUVEAU)
**Fonctionnalité:** Activation et paramètres instant booking

```tsx
Sections:
1. Activation ON/OFF
2. Horaires de travail (lun-dim)
3. Heures d'ouverture/fermeture
4. Réservation minimum à l'avance (2h, 4h, 24h)
5. Max réservations par jour
6. Auto-confirmation ou manuel
7. Politique d'annulation (frais %)
```

#### `/prestataire/instant-booking/services` (NOUVEAU)
**Fonctionnalité:** Gestion des services à prix fixe

```tsx
Components:
- ServicesList (liste services)
- AddServiceModal
- EditServiceModal

Champs:
- Catégorie
- Nom du service
- Description
- Prix fixe
- Durée estimée
- Actif/Inactif
```

#### `/prestataire/instant-booking/calendar` (NOUVEAU)
**Fonctionnalité:** Calendrier de disponibilité

```tsx
Components:
- MonthlyCalendar
- DayView (créneaux horaires)
- BlockTimeModal
- GenerateDefaultSlotsButton

Actions:
- Voir créneaux disponibles/réservés/bloqués
- Bloquer créneaux spécifiques
- Générer créneaux automatiques (30 jours)
- Modifier créneaux individuels
```

#### `/prestataire/instant-bookings` (NOUVEAU)
**Fonctionnalité:** Liste réservations instantanées

```tsx
Similar to client view:
- À venir (avec actions: confirmer, annuler)
- En cours (action: démarrer, terminer)
- Terminées
- Annulées

Notifications:
- Nouvelle réservation (push + email + SMS)
- Rappel 1h avant
- Client a annulé
```

---

### 4. Integration avec système existant

#### Sur page `/services/[category]`
**Ajouter:** Toggle entre 2 modes

```tsx
<div className="mb-8 flex justify-center gap-4">
  <Button variant={mode === 'post' ? 'primary' : 'outline'}>
    📝 Publier une annonce
  </Button>
  <Button variant={mode === 'instant' ? 'primary' : 'outline'}>
    ⚡ Réserver maintenant
  </Button>
</div>

{mode === 'post' && <TaskForm />}
{mode === 'instant' && <InstantBookingList />}
```

#### Sur page d'accueil
**Ajouter:** Section "Services instantanés populaires"

```tsx
<PopularInstantServices>
  - Débouchage (à partir de 75€)
  - Remplacement prise électrique (à partir de 50€)
  - Nettoyage (à partir de 80€)
  - Ouverture de porte (à partir de 120€)
</PopularInstantServices>
```

---

### 5. Notifications & Events

#### Events à créer:
```php
- InstantBookingCreated
- InstantBookingConfirmed
- InstantBookingCancelled
- InstantBookingStarted
- InstantBookingCompleted
- InstantBookingPaymentSuccess
- InstantBookingPaymentFailed
- InstantBookingReminder (1h avant)
```

#### Notifications:
- **Client:**
  - ✅ Réservation confirmée
  - 🔔 Rappel 1h avant
  - 🚀 Prestataire en route
  - ✅ Travail terminé
  
- **Prestataire:**
  - 🆕 Nouvelle réservation
  - 🔔 Rappel 1h avant
  - ⚠️ Client a annulé

---

### 6. Paiement Stripe

#### Payment flow:
1. Client sélectionne service + créneau
2. Stripe Payment Intent créé (hold funds)
3. Si confirmé: capture payment
4. Si annulé dans délai: refund complet
5. Si annulé hors délai: refund partiel (selon politique)

#### Commission platform:
- Calculer commission (ex: 15% du prix)
- Stripe Connect pour transfert vers prestataire
- Retenir commission automatiquement

---

### 7. Règles métier importantes

#### Pour Prestataire:
- ✅ Rating minimum: 4.5⭐
- ✅ Missions complétées minimum: 10
- ✅ Profil vérifié obligatoire
- ✅ Compte Stripe Connect activé

#### Pour Client:
- ✅ Doit voir profil prestataire AVANT réservation
- ✅ Peut annuler gratuitement (selon délai)
- ✅ Reçoit coordonnées prestataire après paiement

#### Politique annulation:
- **Client annule > 2h avant:** Remboursement 100%
- **Client annule < 2h avant:** Remboursement 50%
- **Prestataire annule:** Remboursement 100% + pénalité prestataire
- **Prestataire no-show:** Remboursement 100% + suspension compte

---

## 🔄 Workflow complet

### Côté Prestataire (Setup):
```
1. Active Instant Booking dans settings
2. Configure horaires de travail
3. Ajoute services à prix fixe
4. Génère créneaux de disponibilité (30 jours)
5. Reçoit notifications de nouvelles réservations
```

### Côté Client (Booking):
```
1. Va sur /services/plomberie
2. Clique "Réserver maintenant"
3. Voit liste prestataires disponibles
4. Sélectionne prestataire (voit profil, avis)
5. Choisit service à prix fixe
6. Sélectionne date + heure
7. Saisit adresse
8. Paie avec Stripe
9. Reçoit confirmation instantanée
10. Reçoit rappel 1h avant
11. Prestataire arrive
12. Laisse avis après travail terminé
```

---

## 📊 Avantages vs Système existant

| Aspect | Système Offres (existant) | Instant Booking (nouveau) |
|--------|---------------------------|---------------------------|
| **Délai** | 2-24h (attente offres) | 30 secondes |
| **Prix** | Variable (négociation) | Fixe (transparent) |
| **Type services** | Complexes, sur-mesure | Simples, standardisés |
| **Choix prestataire** | Parmi ceux qui ont répondu | Parmi tous disponibles |
| **Paiement** | Après devis accepté | À la réservation |
| **Idéal pour** | Rénovations, gros travaux | Dépannages, petites interventions |

---

## 🚀 Prochaines étapes

1. **Deploy migration** sur serveur
2. **Créer controllers** backend
3. **Créer pages frontend** client
4. **Créer pages frontend** prestataire  
5. **Intégrer Stripe payments**
6. **Tests end-to-end**
7. **Deploy en production**

---

## ⚠️ Points d'attention

- **Coexistence:** Les 2 systèmes doivent coexister sans conflit
- **UI/UX:** Rendre le choix entre les 2 systèmes clair pour l'utilisateur
- **Commissions:** Calculer commission différemment (Instant = 15%, Offres = 10%?)
- **Support:** Former équipe support sur nouveau système
- **Marketing:** Communiquer avantage Instant Booking aux users

---

**Status:** Backend structure créée ✅  
**Next:** API Controllers + Frontend implementation 🚧
