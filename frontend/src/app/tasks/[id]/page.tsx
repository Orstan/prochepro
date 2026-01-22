"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import UserAvatar from "@/components/UserAvatar";
import PaymentMethodModal from "@/components/PaymentMethodModal";
import LiveTrackingMap from "@/components/tracking/LiveTrackingMap";
import PrestataireStatusButtons from "@/components/tracking/PrestataireStatusButtons";
import GuestCTA from "@/components/GuestCTA";
import { API_BASE_URL } from "@/lib/api";
import { getCategoryByKey } from "@/lib/categoriesApi";

interface ProcheProUser {
  id: number;
  name: string;
  email: string;
  role: "client" | "prestataire" | string;
}

interface Task {
  id: number;
  client_id?: number;
  title: string;
  description?: string | null;
  status: string;
  city?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  location_type?: string | null;
  category?: string | null;
  subcategory?: string | null;
  insurance_level?: string | null;
  insurance_fee?: number | null;
  images?: string[] | null;
  promoted_until?: string | null;
  prestataire_status?: string | null;
  eta_minutes?: number | null;
  arrived_at?: string | null;
  created_at: string;
}

interface Offer {
  id: number;
  task_id: number;
  prestataire_id: number;
  price?: number | null;
  message?: string | null;
  status: string;
  created_at: string;
  prestataire?: {
    id: number;
    name: string;
    avatar?: string;
    level?: number;
    latest_badge?: {
      icon: string;
      name: string;
    };
  };
}

interface Message {
  id: number;
  task_id: number;
  sender_id: number;
  body: string;
  created_at: string;
  sender?: {
    id: number;
    name?: string | null;
    email: string;
    avatar?: string | null;
  };
}

interface Review {
  id: number;
  task_id: number;
  client_id: number;
  prestataire_id: number;
  rating: number;
  comment?: string | null;
  direction: "client_to_prestataire" | "prestataire_to_client" | string;
  client?: {
    id: number;
    name?: string | null;
    avatar?: string | null;
  };
  prestataire?: {
    id: number;
    name?: string | null;
    avatar?: string | null;
  };
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [user, setUser] = useState<ProcheProUser | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState<number | null>(null);

  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [reviewRatingClient, setReviewRatingClient] = useState(5);
  const [reviewCommentClient, setReviewCommentClient] = useState("");
  const [reviewSubmittingClient, setReviewSubmittingClient] = useState(false);
  const [reviewErrorClient, setReviewErrorClient] = useState<string | null>(
    null,
  );

  const [reviewRatingPrestataire, setReviewRatingPrestataire] = useState(5);
  const [reviewCommentPrestataire, setReviewCommentPrestataire] = useState("");
  const [reviewSubmittingPrestataire, setReviewSubmittingPrestataire] = useState(
    false,
  );
  const [reviewErrorPrestataire, setReviewErrorPrestataire] = useState<
    string | null
  >(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error" | null>(
    null,
  );

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment method selection modal
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [pendingOfferForPayment, setPendingOfferForPayment] = useState<{
    offerId: number;
    amount: number;
  } | null>(null);

  const [paymentDetails, setPaymentDetails] = useState<{
    baseAmount: number;
    insuranceFee: number;
    stripeFee: number;
    totalAmount: number;
  } | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [showBankReminderModal, setShowBankReminderModal] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage(null);
      setToastVariant(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  const isClient = user?.role === "client";
  const isPrestataire = user?.role === "prestataire";

  useEffect(() => {
    if (!id) return;
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (stored) {
      try {
        const parsed: ProcheProUser = JSON.parse(stored);
        setUser(parsed);
      } catch {
        window.localStorage.removeItem("prochepro_user");
        setUser(null);
      }
    }
    
    // Завантажуємо дані завдання для всіх (з авторизацією і без)
    void fetchTask(id);
  }, [id, router]);

  // Auto-refresh messages every second (without loading indicator)
  useEffect(() => {
    if (!id) return;
    
    const interval = setInterval(() => {
      void fetchMessages(id, false);
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);
  
  async function confirmPayment(taskId: string, clientId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      
      if (response.ok) {
        setToastMessage("Paiement effectué avec succès !");
        setToastVariant("success");
        void fetchPayment(taskId);
      }
    } catch {
      // Ignore - webhook might have already processed it
    }
  }

  async function fetchTask(taskId: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("Impossible de charger cette annonce.");
      }
      const data: Task = await response.json();
      setTask(data);
      void fetchOffers(taskId);
      void fetchMessages(taskId);
      void fetchReviews(taskId);
      void fetchPayment(taskId);
      if (data.category) {
        const category = await getCategoryByKey(data.category);
        if (category) {
          setCategoryName(category.name);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchOffers(taskId: string) {
    setOffersLoading(true);
    setOfferError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/offers`);
      if (!response.ok) {
        throw new Error("Impossible de charger les offres.");
      }
      const data: Offer[] = await response.json();
      setOffers(data ?? []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOfferError(err.message);
      } else {
        setOfferError("Une erreur inconnue est survenue.");
      }
    } finally {
      setOffersLoading(false);
    }
  }

  async function fetchMessages(taskId: string, showLoading = true) {
    if (showLoading) setMessagesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/messages`);
      if (!response.ok) {
        throw new Error("Impossible de charger les messages.");
      }
      const data: Message[] = await response.json();
      setMessages(data ?? []);
    } catch {
      // м'яко ігноруємо помилку, чат не критичний для задачі
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  }

  async function fetchReviews(taskId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/reviews`);
      if (!response.ok) {
        return;
      }
      const data: Review[] = await response.json();
      setReviews(data ?? []);
    } catch {
      // ігноруємо помилку
    }
  }

  async function fetchPayment(taskId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/payment`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (!data) {
        setPaymentStatus(null);
        setPaymentMethod(null);
      } else {
        setPaymentStatus(typeof data.status === "string" ? data.status : null);
        setPaymentMethod(typeof data.payment_method === "string" ? data.payment_method : null);
      }
    } catch {
      // тихо ігноруємо помилку
    }
  }

  async function handleSubmitOffer(e: FormEvent) {
    e.preventDefault();
    if (!user || !isPrestataire || !id) return;

    // ✅ FIX #1: Validate price is required and is a valid number
    if (!offerPrice || offerPrice.trim() === "") {
      setOfferError("Le prix est obligatoire.");
      return;
    }

    const priceValue = parseFloat(offerPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setOfferError("Le prix doit être un nombre valide supérieur à 0.");
      return;
    }

    // ✅ FIX #2: Check if user already has a pending offer
    const existingOffer = offers.find(
      (o) => o.prestataire_id === user.id && o.status === "pending"
    );
    if (existingOffer) {
      setOfferError("Vous avez déjà envoyé une offre pour cette tâche.");
      return;
    }

    setOfferSubmitting(true);
    setOfferError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prestataire_id: user.id,
          price: Math.round(priceValue), // ✅ FIX #3: Convert to integer for backend
          message: offerMessage || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (response.status === 403 && data?.verification_required) {
          setOfferError("Vous devez vérifier votre identité avant de pouvoir envoyer des offres.");
          setTimeout(() => {
            window.location.href = "/profile/verification";
          }, 2000);
          return;
        }
        throw new Error(data?.message ?? "Impossible d'envoyer votre offre.");
      }

      const data = await response.json();
      const newOffer: Offer = data.offer || data;
      
      // Reload offers to confirm creation
      await fetchOffers(id);
      
      setOfferPrice("");
      setOfferMessage("");
      
      // Check if prestataire needs to connect Stripe
      if (data.prestataire_needs_stripe) {
        setToastMessage("Offre envoyée ! N'oubliez pas de connecter votre compte Stripe pour recevoir les paiements.");
        setToastVariant("success");
        
        // Show Stripe reminder modal after a short delay
        setTimeout(() => {
          if (window.confirm("✅ Votre offre a été envoyée avec succès !\n\n⚠️ IMPORTANT : Pour recevoir les paiements si votre offre est acceptée, vous devez connecter votre compte Stripe.\n\nVoulez-vous le configurer maintenant ?")) {
            window.location.href = "/profile/bank-details";
          }
        }, 1000);
      } else {
        setToastMessage("Offre envoyée avec succès !");
        setToastVariant("success");
      }
    } catch (err: unknown) {
      
      // Перезавантажуємо пропозиції, щоб перевірити чи насправді є помилка
      await fetchOffers(id);
      
      // Перевіряємо чи пропозиція насправді створена
      const createdOffer = offers.find(
        (o) => o.prestataire_id === user?.id && o.status === "pending"
      );
      
      if (createdOffer) {
        // Пропозиція створена, не показуємо помилку
        setOfferPrice("");
        setOfferMessage("");
        setToastMessage("Offre envoyée avec succès !");
        setToastVariant("success");
        return;
      }
      
      // Справжня помилка
      if (err instanceof Error) {
        setOfferError(err.message);
      } else {
        setOfferError("Une erreur inconnue est survenue.");
      }
    } finally {
      setOfferSubmitting(false);
    }
  }

  async function handleAcceptOffer(offerId: number) {
    if (!id || !isClient) return;

    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;

    // Check if offer has a price
    if (!offer.price || offer.price <= 0) {
      setToastMessage("Cette offre n'a pas de prix défini.");
      setToastVariant("error");
      return;
    }

    // ✅ FIX #5: Check if payment already exists
    if (paymentStatus && ["authorized", "captured", "completed"].includes(paymentStatus)) {
      setToastMessage("Un paiement existe déjà pour cette tâche.");
      setToastVariant("error");
      return;
    }

    setAcceptingOfferId(offerId);
    setOfferError(null);

    try {
      // First, validate the offer can be accepted
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/offers/${offerId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json().catch(() => null);

      if (data?.error_code === 'no_price') {
        setToastMessage("Cette offre n'a pas de prix défini.");
        setToastVariant("error");
        setAcceptingOfferId(null);
        return;
      }

      // Payment required - show payment method selection modal
      if (data?.payment_required) {
        const baseAmount = data.amount;
        setPendingOfferForPayment({ offerId, amount: baseAmount });
        setShowPaymentMethodModal(true);
        setAcceptingOfferId(null);
        return;
      }

      // If response is ok and has offer/task data (legacy flow)
      if (response.ok && data?.offer && data?.task) {
        setOffers((prev) =>
          prev.map((off) =>
            off.id === data.offer.id
              ? data.offer
              : { ...off, status: off.id === data.offer.id ? "accepted" : "rejected" },
          ),
        );
        setTask(data.task);
        setToastMessage("Offre acceptée avec succès !");
        setToastVariant("success");
      }
    } catch (err: unknown) {
      setAcceptingOfferId(null);
      if (err instanceof Error) {
        setToastMessage(err.message);
        setToastVariant("error");
      }
    }
  }

  async function handlePaymentMethodSelect(method: "online" | "cash") {
    if (!id || !pendingOfferForPayment) return;

    setProcessingPayment(true);

    try {
      const { offerId, amount } = pendingOfferForPayment;

      if (method === "online") {
        // Online payment - full amount + Stripe fee only (no platform fee)
        const stripeFeePercent = 0.029;
        const stripeFeeFixed = 0.30;
        const stripeFee = Math.round((amount * stripeFeePercent + stripeFeeFixed) * 100) / 100;
        const totalAmount = Math.round((amount + stripeFee) * 100) / 100;

        const checkoutRes = await fetch(`${API_BASE_URL}/api/tasks/${id}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            base_amount: amount,
            offer_id: offerId,
          }),
        });

        if (!checkoutRes.ok) {
          const checkoutData = await checkoutRes.json().catch(() => null);
          throw new Error(checkoutData?.message ?? "Erreur lors de la création du paiement.");
        }

        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
        throw new Error("URL de paiement non disponible.");
      } else {
        // Cash payment - only 10% commission
        const checkoutRes = await fetch(`${API_BASE_URL}/api/tasks/${id}/checkout-cash`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total_amount: amount,
            offer_id: offerId,
          }),
        });

        if (!checkoutRes.ok) {
          const checkoutData = await checkoutRes.json().catch(() => null);
          throw new Error(checkoutData?.message ?? "Erreur lors de la création du paiement.");
        }

        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
        throw new Error("URL de paiement non disponible.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToastMessage(err.message);
        setToastVariant("error");
      }
    } finally {
      setProcessingPayment(false);
      setShowPaymentMethodModal(false);
      setPendingOfferForPayment(null);
    }
  }

  async function handleCancelTask() {
    if (!id || !isClient || !task) return;
    if (!["published", "assigned"].includes(task.status)) return;

    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette annonce ?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Impossible d'annuler cette annonce.");
      }

      const updated: Task = await response.json();
      setTask(updated);
      setToastMessage("L'annonce a été annulée.");
      setToastVariant("success");
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Erreur");
      setToastVariant("error");
    }
  }

  async function handleDeleteTask() {
    if (!id || !isClient || !task) return;
    if (!["published", "draft"].includes(task.status)) return;

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Impossible de supprimer cette annonce.");
      }

      router.push("/dashboard");
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Erreur");
      setToastVariant("error");
    }
  }

  async function handleWithdrawOffer(offerId: number) {
    if (!id || !isPrestataire) return;

    if (!window.confirm("Êtes-vous sûr de vouloir retirer votre offre ?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/offers/${offerId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Impossible de retirer cette offre.");
      }

      const data = await response.json();
      setOffers((prev) => prev.map((o) => o.id === offerId ? data.offer : o));
      setToastMessage("Votre offre a été retirée.");
      setToastVariant("success");
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Erreur");
      setToastVariant("error");
    }
  }

  async function handleCompleteTask() {
    if (!id || !isClient || !task || task.status === "completed") return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Impossible de marquer l'annonce comme terminée.");
      }

      const updated: Task = await response.json();
      setTask(updated);
      void fetchPayment(id);
      setToastMessage("L'annonce a été marquée comme terminée.");
      setToastVariant("success");
      
      // Show bank reminder to prestataire if they're viewing (only for online payments)
      if (isPrestataire && paymentMethod === 'online') {
        setShowBankReminderModal(true);
      }
    } catch {
      // можна додати показ помилки пізніше
    }
  }

  // Show bank reminder modal when prestataire views a completed task (only for online payments)
  useEffect(() => {
    if (task && task.status === "completed" && isPrestataire && paymentMethod === 'online') {
      // Check if we've already shown this reminder for this task
      const reminderKey = `bank_reminder_shown_${id}`;
      const alreadyShown = localStorage.getItem(reminderKey);
      
      if (!alreadyShown) {
        setShowBankReminderModal(true);
        localStorage.setItem(reminderKey, "true");
      }
    }
  }, [task, isPrestataire, id, paymentMethod]);

  async function handleSubmitClientReview(e: FormEvent) {
    e.preventDefault();
    if (!user || !id || !task || task.status !== "completed") return;

    const acceptedOffer = offers.find((o) => o.status === "accepted");
    if (!acceptedOffer) return;

    setReviewSubmittingClient(true);
    setReviewErrorClient(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: user.id,
          prestataire_id: acceptedOffer.prestataire_id,
          rating: reviewRatingClient,
          comment: reviewCommentClient || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Impossible d'envoyer l'avis.");
      }

      const created: Review = await response.json();
      setReviews((prev) => [...prev.filter((r) => r.id !== created.id), created]);
      setToastMessage("Votre avis a bien été envoyé.");
      setToastVariant("success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setReviewErrorClient(err.message);
      } else {
        setReviewErrorClient("Une erreur inconnue est survenue.");
      }
    } finally {
      setReviewSubmittingClient(false);
    }
  }

  async function handleSubmitPrestataireReview(e: FormEvent) {
    e.preventDefault();
    if (!user || !id || !task || task.status !== "completed" || !task.client_id)
      return; // Додано перевірку на task.client_id

    setReviewSubmittingPrestataire(true);
    setReviewErrorPrestataire(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/reviews/from-prestataire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // !!! ВИПРАВЛЕНО: Додано client_id, який має бути присутнім для відгуку "prestataire_to_client"
          client_id: task.client_id, 
          prestataire_id: user.id,
          rating: reviewRatingPrestataire,
          comment: reviewCommentPrestataire.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Impossible d'envoyer l'avis.");
      }

      const created: Review = await response.json();
      setReviews((prev) => [...prev.filter((r) => r.id !== created.id), created]);
      setToastMessage("Votre avis a bien été envoyé.");
      setToastVariant("success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setReviewErrorPrestataire(err.message);
      } else {
        setReviewErrorPrestataire("Une erreur inconnue est survenue.");
      }
    } finally {
      setReviewSubmittingPrestataire(false);
    }
  }

  // Calculate total with Stripe fee (2.9% + 0.30€)
  function calculateTotalWithFee(baseAmount: number): number {
    const stripeFeePercent = 0.029;
    const stripeFeeFixed = 0.30;
    return Math.ceil(((baseAmount + stripeFeeFixed) / (1 - stripeFeePercent)) * 100) / 100;
  }

  function openPaymentModal() {
    if (!user || !id || !task) return;

    const acceptedOffer = offers.find((o) => o.status === "accepted");
    if (!acceptedOffer) {
      setToastMessage("Impossible de payer sans offre acceptée.");
      setToastVariant("error");
      return;
    }
    
    const baseAmount = Number(acceptedOffer.price ?? task.budget_max ?? task.budget_min ?? 0);
    if (baseAmount <= 0) return;

    // Get insurance fee from task (convert to number as it may come as string from API)
    const insuranceFee = Number(task.insurance_fee) || 0;
    
    // Calculate total with insurance
    const amountWithInsurance = baseAmount + insuranceFee;
    const totalAmount = calculateTotalWithFee(amountWithInsurance);
    const stripeFee = Math.round((totalAmount - amountWithInsurance) * 100) / 100;

    setPaymentDetails({ baseAmount, insuranceFee, stripeFee, totalAmount });
    setShowPaymentModal(true);
  }

  async function handleConfirmPayment() {
    if (!paymentDetails || !id) return;

    setProcessingPayment(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentDetails.totalAmount,
          base_amount: paymentDetails.baseAmount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setShowPaymentModal(false);
      setToastMessage(data.message || "Erreur lors de la création du paiement.");
      setToastVariant("error");
    } catch {
      setShowPaymentModal(false);
      setToastMessage("Erreur de connexion au service de paiement.");
      setToastVariant("error");
    } finally {
      setProcessingPayment(false);
    }
  }

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!user || !id || !task || !messageBody.trim()) return;

    // чат дозволений тільки коли задача в роботі або завершена
    if (task.status !== "in_progress" && task.status !== "completed") return;

    setSendingMessage(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: user.id,
          body: messageBody.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'envoyer le message.");
      }

      const newMessage: Message = await response.json();
      setMessages((prev) => [...prev, newMessage]);
      setMessageBody("");
    } catch {
      // можна додати відображення помилки пізніше
    } finally {
      setSendingMessage(false);
    }
  }

  const clientReview = reviews.find(
    (r) => r.direction === "client_to_prestataire",
  );
  const prestataireReview = reviews.find(
    (r) => r.direction === "prestataire_to_client",
  );

  const hasAlreadyProposed =
    isPrestataire && user && offers.some((offer) => offer.prestataire_id === user.id);
  
  const myAcceptedOffer = isPrestataire && user
    ? offers.find((o) => o.prestataire_id === user.id && o.status === "accepted")
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-slate-800">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-slate-700 hover:text-slate-900 mb-4"
      >
        ↩ Retour
      </button>

      {toastMessage && (
        <div
          className={`mb-4 rounded-md px-4 py-2 text-sm ${{
            success: "bg-emerald-50 text-emerald-700",
            error: "bg-red-50 text-red-700",
            null: "bg-emerald-50 text-emerald-700",
          }[toastVariant ?? "success"]}`}
        >
          {toastMessage}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-700">Chargement de l'annonce...</p>
      ) : error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : !task ? (
        <p className="text-sm text-slate-700">Annonce introuvable.</p>
      ) : (
        <div className="space-y-6">
          {/* Task info */}
          <div className="rounded-xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                    {task.title}
                  </h1>
                  {task.promoted_until && new Date(task.promoted_until) > new Date() && (
                    <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1.5">
                      <span>⭐</span>
                      <span>Recommandé</span>
                    </span>
                  )}
                </div>
                {task.city && (
                  <p className="text-sm text-slate-700 mb-1">
                    📍 Ville : {task.city}
                  </p>
                )}
                {task.category && (
                  <p className="text-sm text-slate-700 mb-1">
                    🏷️ Catégorie : {categoryName || task.category}
                    {task.subcategory && ` → ${task.subcategory}`}
                  </p>
                )}
                <p className="text-xs text-slate-500 mb-4">
                  Publiée le{" "}
                  {new Date(task.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>

              {/* Actions pour le client propriétaire */}
              {isClient && task.client_id === user?.id && (
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {["published", "draft"].includes(task.status) && (
                    <>
                      <a
                        href={`/tasks/${task.id}/edit`}
                        className="rounded-lg border border-slate-200 p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        title="Modifier"
                      >
                        <span className="hidden sm:inline">Modifier</span>
                        <span className="sm:hidden">✏️</span>
                      </a>
                      <button
                        onClick={handleDeleteTask}
                        className="rounded-lg border border-red-200 p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <span className="hidden sm:inline">Supprimer</span>
                        <span className="sm:hidden">🗑️</span>
                      </button>
                    </>
                  )}
                  {["published", "assigned"].includes(task.status) && (
                    <button
                      onClick={handleCancelTask}
                      className="rounded-lg border border-amber-200 p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      title="Annuler"
                    >
                      <span className="hidden sm:inline">Annuler</span>
                      <span className="sm:hidden">❌</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-slate-800 whitespace-pre-line">
                {task.description}
              </p>
            )}

            {/* Task Images Gallery */}
            {task.images && task.images.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-600 mb-2">📷 Photos ({task.images.length})</p>
                <div className="flex flex-wrap gap-2">
                  {task.images.map((img, index) => (
                    <a
                      key={index}
                      href={`${API_BASE_URL}${img}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden ring-1 ring-slate-200 hover:ring-sky-400 transition-all"
                    >
                      <Image
                        src={`${API_BASE_URL}${img}`}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Informations
            </h2>

            <ul className="space-y-1 text-sm">
              <li>
                Statut :
                <span
                  className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    task.status === "published"
                      ? "bg-sky-100 text-sky-700"
                      : task.status === "in_progress"
                      ? "bg-amber-100 text-amber-700"
                      : task.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {task.status}
                </span>
              </li>

              {task.location_type && (
                <li>
                  Type d'intervention :{" "}
                  <span className="font-medium">
                    {task.location_type === "on_site" ? "Sur place" : "À distance"}
                  </span>
                </li>
              )}
              {(task.budget_min != null || task.budget_max != null) && (
                <li>
                  Budget :
                  {task.budget_min != null && ` ${task.budget_min}€`}
                  {task.budget_max != null && ` - ${task.budget_max}€`}
                </li>
              )}
            </ul>

            {/* Insurance badge */}
            {task.insurance_level ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 px-3 py-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <span className="text-xs font-semibold text-sky-800">
                    Garantie {task.insurance_level.charAt(0).toUpperCase() + task.insurance_level.slice(1)}
                  </span>
                  <p className="text-[10px] text-sky-600">
                    Couverture jusqu&apos;à {task.insurance_level === 'basic' ? '500' : task.insurance_level === 'standard' ? '2 000' : '5 000'}€
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <span className="text-xs font-medium text-slate-700">Garantie ProchePro</span>
                  <p className="text-[10px] text-slate-500">Protection de base incluse</p>
                </div>
              </div>
            )}

            {paymentStatus && (
              <p className="text-xs text-slate-600 mt-3">
                Paiement :
                <span
                  className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    paymentStatus === "authorized"
                      ? "bg-amber-100 text-amber-700"
                      : paymentStatus === "captured"
                      ? "bg-emerald-100 text-emerald-700"
                      : paymentStatus === "failed"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {paymentStatus}
                </span>
              </p>
            )}
            {isClient &&
              task.status === "in_progress" &&
              !paymentStatus && (
                <button
                  type="button"
                  onClick={openPaymentModal}
                  className="mt-2 inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
                >
                  Payer la mission
                </button>
              )}
            {isPrestataire && task.client_id && (
              <button
                type="button"
                onClick={() => router.push(`/clients/${task.client_id}`)}
                className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:border-[#1E88E5] hover:text-[#1E88E5]"
              >
                Voir le profil du client
              </button>
            )}
            {isClient &&
              task.status === "in_progress" &&
              paymentStatus === "authorized" && (
                <button
                  type="button"
                  onClick={handleCompleteTask}
                  className="mt-3 inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Marquer l'annonce comme terminée
                </button>
              )}
          </div>

          {/* CTA для незареєстрованих користувачів */}
          {!user && (
            <GuestCTA message="Pour voir toutes les informations et proposer vos services, vous devez" />
          )}

          {/* Форма офера для prestataire (тільки коли annonce publiée і ще нема офера від нього) */}
          {isPrestataire && task.status === "published" && !hasAlreadyProposed && (
            <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Proposer une offre
              </h2>

              {offerError && (
                <div className="mb-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                  {offerError}
                </div>
              )}

              <form
                onSubmit={handleSubmitOffer}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Prix proposé (€)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Ex : 80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Message (facultatif)
                  </label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Présentez brièvement votre expérience et votre proposition."
                  />
                </div>
                <button
                  type="submit"
                  disabled={offerSubmitting}
                  className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                >
                  {offerSubmitting ? "Envoi en cours..." : "Envoyer l'offre"}
                </button>
              </form>
            </div>
          )}

          {isPrestataire && hasAlreadyProposed && (
            <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Votre offre
              </h2>
              {offers
                .filter((o) => o.prestataire_id === user?.id)
                .map((myOffer) => (
                  <div
                    key={myOffer.id}
                    className="rounded-lg border border-slate-200 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    <div>
                      {myOffer.price != null && (
                        <p className="text-sm text-slate-700">
                          Prix proposé : <span className="font-medium">{myOffer.price}€</span>
                        </p>
                      )}
                      {myOffer.message && (
                        <p className="text-sm text-slate-600 mt-1">{myOffer.message}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Statut :
                        <span
                          className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            myOffer.status === "pending"
                              ? "bg-slate-100 text-slate-700"
                              : myOffer.status === "accepted"
                              ? "bg-emerald-100 text-emerald-700"
                              : myOffer.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : myOffer.status === "withdrawn"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {myOffer.status === "pending" && "En attente"}
                          {myOffer.status === "accepted" && "Acceptée"}
                          {myOffer.status === "rejected" && "Refusée"}
                          {myOffer.status === "withdrawn" && "Retirée"}
                        </span>
                      </p>
                    </div>
                    {myOffer.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleWithdrawOffer(myOffer.id)}
                        className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      >
                        Retirer l'offre
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
          
          {/* Кнопки статусу для майстра (тільки для завдань Sur place і коли пропозиція прийнята) */}
          {isPrestataire && myAcceptedOffer && task.status === "in_progress" && (
            <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Statut de la mission
              </h2>
              <PrestataireStatusButtons
                taskId={task.id}
                currentStatus={task.prestataire_status || null}
                locationType={task.location_type || null}
                onStatusUpdate={() => void fetchTask(id)}
              />
            </div>
          )}

          {/* Карта трекування для клієнта та майстра */}
         {task.status === "in_progress" && task.prestataire_status === "on_the_way" && (
          <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
      📍 {isClient ? "Suivi en temps réel" : "Votre itinéraire"}
           </h2>
          <LiveTrackingMap taskId={task.id} />
           </div>
           )}

          {/* Повідомлення про прибуття для клієнта */}
          {isClient && task.status === "in_progress" && task.prestataire_status === "arrived" && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-sm font-semibold text-green-800">
                    Le prestataire est arrivé
                  </h3>
                  <p className="text-xs text-green-600">
                    Il est sur place et prêt à commencer
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Список оферів для client */}
        {isClient && (
          <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Offres reçues
            </h2>

            {offersLoading ? (
              <p className="text-sm text-slate-600">
                Chargement des offres...
              </p>
            ) : offers.length === 0 ? (
              <p className="text-sm text-slate-600">
                Vous n&apos;avez pas encore reçu d&apos;offre pour cette annonce.
              </p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm flex flex-col gap-3"
                  >
                    {/* Prestataire Info with Badges */}
                    {offer.prestataire && (
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                        <UserAvatar 
                          avatar={offer.prestataire.avatar}
                          name={offer.prestataire.name}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{offer.prestataire.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {offer.prestataire.level && offer.prestataire.level > 1 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                🏆 Niveau {offer.prestataire.level}
                              </span>
                            )}
                            {offer.prestataire.latest_badge && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                {offer.prestataire.latest_badge.icon} {offer.prestataire.latest_badge.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        {!offer.prestataire && (
                          <p className="font-medium text-slate-900">
                            Offre #{offer.id}
                          </p>
                        )}
                        {offer.message && (
                          <p className="mt-1 text-slate-700">{offer.message}</p>
                        )}
                        {isClient && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/prestataires/${offer.prestataire_id}`)
                            }
                            className="mt-1 inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-[#1E88E5] hover:text-[#1E88E5]"
                          >
                            Voir le profil complet
                          </button>
                        )}
                      </div>

                    <div className="text-xs text-slate-500 flex flex-col items-start md:items-end gap-2">
                      {offer.price != null && (
                        <span>Prix proposé : {offer.price}€</span>
                      )}
                      <span>
                        Statut :
                        <span
                          className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            offer.status === "pending"
                              ? "bg-slate-100 text-slate-700"
                              : offer.status === "accepted"
                              ? "bg-emerald-100 text-emerald-700"
                              : offer.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </span>
                      <span>
                        Reçue le{" "}
                        {new Date(
                          offer.created_at,
                        ).toLocaleDateString("fr-FR")}
                      </span>
                      {offer.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={acceptingOfferId === offer.id}
                          className="mt-1 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {acceptingOfferId === offer.id
                            ? "Redirection..."
                            : `Accepter l'offre ${offer.price ? `(${offer.price}€)` : ""}`}
                        </button>
                      )}
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Відгук клієнта про виконавця */}
        {(isClient || isPrestataire) && task.status === "completed" && (
          <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Avis du client
            </h2>

            {clientReview &&
            typeof clientReview.rating === "number" &&
            (isClient || (isPrestataire && prestataireReview)) ? (
              <div className="flex items-start gap-3">
                <UserAvatar
                  avatar={clientReview.client?.avatar}
                  name={clientReview.client?.name}
                  size="sm"
                />
                <div className="flex-1 space-y-1 text-sm">
                  <p className="text-xs font-medium text-slate-700">
                    {clientReview.client?.name || "Client"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">
                      {"★".repeat(clientReview.rating)}
                      {"☆".repeat(5 - clientReview.rating)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {clientReview.rating}/5
                    </span>
                  </div>
                  {clientReview.comment && (
                    <p className="text-sm text-slate-700 mt-1">
                      {clientReview.comment}
                    </p>
                  )}
                </div>
              </div>
            ) : isClient ? (
              <div className="space-y-3">
                {reviewErrorClient && (
                  <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                    {reviewErrorClient}
                  </div>
                )}

                <form
                  onSubmit={handleSubmitClientReview}
                  className="space-y-3 text-sm"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Note
                    </label>
                    <div className="flex items-center gap-1 text-lg text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRatingClient(star)}
                          className={
                            star <= reviewRatingClient
                              ? "cursor-pointer"
                              : "cursor-pointer text-slate-300"
                          }
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Commentaire (facultatif)
                    </label>
                    <textarea
                      value={reviewCommentClient}
                      onChange={(e) => setReviewCommentClient(e.target.value)}
                      rows={3}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="Partagez votre expérience avec ce prestataire."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmittingClient}
                    className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                  >
                    {reviewSubmittingClient ? "Envoi..." : "Envoyer l'avis"}
                  </button>
                </form>
              </div>
            ) : isPrestataire ? (
              <p className="text-sm text-slate-600">
                L'avis du client sera visible après que vous aurez laissé le vôtre.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Le client n'a pas encore laissé d'avis pour cette annonce.
              </p>
            )}
          </div>
        )}

        {/* Відгук виконавця про клієнта */}
        {(isClient || isPrestataire) && task.status === "completed" && (
          <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Avis du prestataire
            </h2>

            {prestataireReview &&
            typeof prestataireReview.rating === "number" &&
            (isPrestataire || (isClient && clientReview)) ? (
              <div className="flex items-start gap-3">
                <UserAvatar
                  avatar={prestataireReview.prestataire?.avatar}
                  name={prestataireReview.prestataire?.name}
                  size="sm"
                />
                <div className="flex-1 space-y-1 text-sm">
                  <p className="text-xs font-medium text-slate-700">
                    {prestataireReview.prestataire?.name || "Prestataire"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">
                      {"★".repeat(prestataireReview.rating)}
                      {"☆".repeat(5 - prestataireReview.rating)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {prestataireReview.rating}/5
                    </span>
                  </div>
                  {prestataireReview.comment && (
                    <p className="text-sm text-slate-700 mt-1">
                      {prestataireReview.comment}
                    </p>
                  )}
                </div>
              </div>
            ) : isPrestataire ? (
              <div className="space-y-3">
                {reviewErrorPrestataire && (
                  <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                    {reviewErrorPrestataire}
                  </div>
                )}

                <form
                  onSubmit={handleSubmitPrestataireReview}
                  className="space-y-3 text-sm"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Note
                    </label>
                    <div className="flex items-center gap-1 text-lg text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRatingPrestataire(star)}
                          className={
                            star <= reviewRatingPrestataire
                              ? "cursor-pointer"
                              : "cursor-pointer text-slate-300"
                          }
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Commentaire (facultatif)
                    </label>
                    <textarea
                      value={reviewCommentPrestataire}
                      onChange={(e) =>
                        setReviewCommentPrestataire(e.target.value)
                      }
                      rows={3}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="Partagez votre expérience avec ce client."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmittingPrestataire}
                    className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                  >
                    {reviewSubmittingPrestataire ? "Envoi..." : "Envoyer l'avis"}
                  </button>
                </form>
              </div>
            ) : isClient ? (
              <p className="text-sm text-slate-600">
                L'avis du prestataire sera visible après que vous aurez laissé le vôtre.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Le prestataire n&apos;a pas encore laissé d&apos;avis pour cette annonce.
              </p>
            )}
          </div>
        )}

        {/* Повідомлення / чат для обох ролей (тільки коли задача в роботі або завершена) */}
        {(isClient || isPrestataire) &&
          task &&
          (task.status === "in_progress" || task.status === "completed") && (
            <div className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100 text-sm text-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Messages
              </h2>

              {messagesLoading ? (
                <p className="text-sm text-slate-600">
                  Chargement des messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-slate-600 mb-3">
                  Pas encore de messages pour cette annonce.
                </p>
              ) : (
                <div className="mb-3 max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
                  {messages.map((m) => {
                    const isMine = m.sender_id === user.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex items-end gap-2 ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMine && (
                          <UserAvatar
                            avatar={m.sender?.avatar}
                            name={m.sender?.name}
                            size="xs"
                          />
                        )}
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 text-xs shadow-sm ${
                            isMine
                              ? "bg-sky-600 text-white"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p className="mt-1 text-[10px] opacity-75">
                            {m.sender?.name ?? m.sender?.email ?? ""} •{" "}
                            {new Date(m.created_at).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        {isMine && (
                          <UserAvatar
                            avatar={m.sender?.avatar}
                            name={m.sender?.name}
                            size="xs"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {task?.status === "in_progress" ? (
                <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Écrire un message..."
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !messageBody.trim()}
                    className="self-end rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                  >
                    {sendingMessage ? "Envoi..." : "Envoyer"}
                  </button>
                </form>
              ) : (
                <div className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-center text-sm text-slate-500">
                  La conversation est terminée
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !processingPayment && setShowPaymentModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Récapitulatif du paiement</h3>
                  <p className="text-sm text-white/80">Paiement sécurisé via Stripe</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Montant pour le prestataire</span>
                  <span className="font-semibold text-slate-900">{paymentDetails.baseAmount.toFixed(2)} €</span>
                </div>
                {(paymentDetails.insuranceFee ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600">🛡️ Garantie {task?.insurance_level}</span>
                    </div>
                    <span className="font-medium text-sky-600">{(paymentDetails.insuranceFee ?? 0).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600">Frais de traitement</span>
                    <span className="text-xs text-slate-400">(2.9% + 0.30€)</span>
                  </div>
                  <span className="font-medium text-slate-700">{paymentDetails.stripeFee.toFixed(2)} €</span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total à payer</span>
                    <span className="text-2xl font-bold text-[#1E88E5]">{paymentDetails.totalAmount.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>SSL 256-bit</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processingPayment}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E88E5] text-sm font-semibold text-white hover:bg-[#1565C0] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Traitement...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </>
                )}
                Payer maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Reminder Modal for Prestataires */}
      {showBankReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <h3 className="text-xl font-bold">Mission terminée !</h3>
                  <p className="text-sm text-white/90">Félicitations pour votre travail</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-slate-700">
                Votre mission a été marquée comme <strong>terminée</strong> par le client. C&apos;est une excellente nouvelle !
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                  <span>🏦</span> Pour recevoir votre paiement
                </h4>
                <p className="text-sm text-amber-800">
                  Afin de recevoir vos fonds, vous devez{" "}
                  <button
                    onClick={() => {
                      setShowBankReminderModal(false);
                      router.push("/profile/bank");
                    }}
                    className="font-bold underline hover:text-amber-900 transition"
                  >
                    connecter votre compte bancaire
                  </button>
                  {" "}dans votre profil.
                </p>
                <p className="text-sm text-amber-800">
                  Sans ces informations, nous ne pourrons pas effectuer le virement bancaire.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                <h4 className="font-semibold text-slate-900">📋 Étapes suivantes :</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                  <li>Rendez-vous sur la page <strong>Coordonnées bancaires</strong></li>
                  <li>Connectez votre banque</li>
                  <li>Vos fonds seront virés automatiquement</li>
                </ol>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowBankReminderModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Plus tard
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBankReminderModal(false);
                  router.push("/profile/bank");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-semibold text-white hover:from-emerald-600 hover:to-teal-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Renseigner mes coordonnées
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => {
          setShowPaymentMethodModal(false);
          setPendingOfferForPayment(null);
        }}
        onSelectMethod={handlePaymentMethodSelect}
        amount={pendingOfferForPayment?.amount ?? 0}
        loading={processingPayment}
      />
    </div>
  );
}