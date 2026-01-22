"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import InstallPWA from "@/components/InstallPWA";
import { API_BASE_URL } from "@/lib/api";

interface SiteShellProps {
  children: React.ReactNode;
}

type Notification = {
  id: number;
  type: string;
  data?: {
    task_id?: number;
    task_title?: string;
    message?: string;
    referred_name?: string;
    credit_type?: string;
    amount?: number;
    ticket_id?: number;
    subject?: string;
    status?: string;
    priority?: string;
    user_name?: string;
  };
  read_at?: string | null;
  created_at: string;
};

export function SiteShell({ children }: SiteShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<null | { id?: number; name?: string; role?: string; roles?: string[]; active_role?: string; avatar?: string | null }>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<number | null>(null);
  const [roleSwitching, setRoleSwitching] = useState(false);
  const [appStoreModal, setAppStoreModal] = useState<'google' | 'apple' | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const prevUnreadIdsRef = useRef<number[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close notifications panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
        setExpandedNotificationId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  // Check if user is on a chat page (task detail or messages)
  const isOnChatPage = useCallback(() => {
    if (!pathname) return false;
    // /tasks/123 or /messages/123
    return /^\/tasks\/\d+$/.test(pathname) || /^\/messages\/\d+$/.test(pathname);
  }, [pathname]);

  // Get current task ID from URL if on chat page
  const getCurrentTaskId = useCallback(() => {
    if (!pathname) return null;
    const taskMatch = pathname.match(/^\/tasks\/(\d+)$/);
    if (taskMatch) return parseInt(taskMatch[1], 10);
    const messageMatch = pathname.match(/^\/messages\/(\d+)$/);
    if (messageMatch) return parseInt(messageMatch[1], 10);
    return null;
  }, [pathname]);

  async function handleSwitchRole(newRole: string) {
    if (!currentUser?.id) return;
    setRoleSwitching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser.id, role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user;
        setCurrentUser(updatedUser);
        localStorage.setItem("prochepro_user", JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setRoleSwitching(false);
    }
  }

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitializedRef = useRef(false);

  // Initialize audio on first user interaction
  useEffect(() => {
    function initAudio() {
      if (audioInitializedRef.current) return;
      audioInitializedRef.current = true;

      audioRef.current = new Audio("/sounds/notification.mp3");
      audioRef.current.volume = 0.5;
      // Preload the audio
      audioRef.current.load();
    }

    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("keydown", initAudio, { once: true });

    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notification.mp3");
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Audio play blocked:", err);
      });
    } catch (err) {
      console.log("Audio error:", err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    function loadUser() {
      try {
        const raw = window.localStorage.getItem("prochepro_user");
        if (!raw) {
          setCurrentUser(null);
          return;
        }
        const parsed = JSON.parse(raw) as { id?: number; name?: string; role?: string; avatar?: string };
        setCurrentUser(parsed ?? null);
      } catch {
        setCurrentUser(null);
      }
    }

    loadUser();

    // Listen for storage changes (logout from other tabs or same tab)
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "prochepro_user") {
        loadUser();
      }
    }

    // Custom event for same-tab logout
    function handleLogout() {
      setCurrentUser(null);
      setNotifications([]);
    }

    // Custom event for same-tab login
    function handleLogin() {
      loadUser();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("prochepro_logout", handleLogout);
    window.addEventListener("prochepro_login", handleLogin);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("prochepro_logout", handleLogout);
      window.removeEventListener("prochepro_login", handleLogin);
    };
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    let intervalId: number | undefined;

    async function fetchUnreadMessagesCount() {
      try {
        const raw = window.localStorage.getItem("prochepro_user");
        if (!raw) {
          setUnreadMessagesCount(0);
          return;
        }
        const parsed = JSON.parse(raw) as { id?: number };
        if (!parsed?.id) return;

        const res = await fetch(`${API_BASE_URL}/api/messages/unread-count?user_id=${parsed.id}`);
        if (!res.ok) return;
        
        const json = await res.json() as { unread_count?: number };
        setUnreadMessagesCount(json.unread_count ?? 0);
      } catch {
        // Silent fail
      }
    }

    void fetchUnreadMessagesCount();
    intervalId = window.setInterval(fetchUnreadMessagesCount, 5000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    let intervalId: number | undefined;

    async function fetchNotifications() {
      try {
        const raw = window.localStorage.getItem("prochepro_user");
        if (!raw) {
          setNotifications([]);
          return;
        }
        const parsed = JSON.parse(raw) as { id?: number; push_notifications?: boolean };
        if (!parsed?.id) return;

        const res = await fetch(
          `${API_BASE_URL}/api/notifications?user_id=${parsed.id}&per_page=20`,
        );
        if (!res.ok) return;
        const json = (await res.json()) as { data?: Notification[] };
        let data = json.data ?? [];

        // If user is on a chat page, auto-mark chat notifications for this task as read
        const currentTaskId = getCurrentTaskId();
        if (isOnChatPage() && currentTaskId) {
          const chatNotificationsToMark = data.filter(
            (n) => n.type === 'chat_message' && n.data?.task_id === currentTaskId && !n.read_at
          );

          // Mark them as read in background
          for (const notif of chatNotificationsToMark) {
            void fetch(`${API_BASE_URL}/api/notifications/${notif.id}/read`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: parsed.id }),
            });
          }

          // Update local state to mark them as read
          data = data.map((n) =>
            n.type === 'chat_message' && n.data?.task_id === currentTaskId && !n.read_at
              ? { ...n, read_at: new Date().toISOString() }
              : n
          );
        }

        // Визначаємо, чи зʼявились нові непрочитані сповіщення
        const newUnreadIds = data.filter((n) => !n.read_at).map((n) => n.id);
        const prevUnreadIds = prevUnreadIdsRef.current;

        // Find truly new notifications (not just chat messages for current task)
        const newNotifications = data.filter(
          (n) => !n.read_at && !prevUnreadIds.includes(n.id)
        );

        // Check if there are new notifications that should trigger sound
        const hasNewUnreadForSound = newNotifications.some((n) => {
          // If on chat page and it's a chat_message for current task, don't count it
          if (isOnChatPage() && n.type === 'chat_message' && n.data?.task_id === currentTaskId) {
            return false;
          }
          return true;
        });

        // Play sound for new notifications (skip first load to avoid sound on page refresh)
        if (hasNewUnreadForSound && prevUnreadIdsRef.current.length > 0) {
          // Check if push notifications are enabled (default: true)
          const pushEnabled = parsed.push_notifications !== false;
          if (pushEnabled) {
            playNotificationSound();
          }
        }

        // Mark that we've done initial load
        if (prevUnreadIdsRef.current.length === 0 && newUnreadIds.length > 0) {
          // First load - don't play sound but mark as initialized
          prevUnreadIdsRef.current = newUnreadIds;
          setNotifications(data);
          return;
        }

        prevUnreadIdsRef.current = newUnreadIds;
        setNotifications(data);
      } catch {
        // тихо ігноруємо помилки нотифікацій
      }
    }

    void fetchNotifications();
    intervalId = window.setInterval(fetchNotifications, 5000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [playNotificationSound, isOnChatPage, getCurrentTaskId]);

  async function markNotificationAsRead(notificationId: number) {
    try {
      const raw = window.localStorage.getItem("prochepro_user");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { id?: number };
      if (!parsed?.id) return;

      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parsed.id }),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n,
        ),
      );
    } catch {
      // ігноруємо помилки
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      const raw = window.localStorage.getItem("prochepro_user");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { id?: number };
      if (!parsed?.id) return;

      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parsed.id }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    } catch {
      // ігноруємо помилки
    }
  }

  async function handleNotificationClick(notification: Notification) {
    await markNotificationAsRead(notification.id);

    if (notification.type === 'referral_bonus') {
      window.location.href = '/profile/referral';
    } else if (notification.type === 'credits_added' || notification.type === 'credits_purchased') {
      window.location.href = '/pricing';
    } else if (notification.type === 'chat_message') {
      const chatRoomId = (notification.data as any)?.chat_room_id;
      if (chatRoomId) {
        // Admins go to admin chat page
        if (currentUser?.role === 'admin' || (currentUser as any)?.is_admin) {
          window.location.href = `/admin/chat/${chatRoomId}`;
        } else {
          // For users, trigger chat widget - using both methods for reliability
          setNotificationsOpen(false);
          
          // Method 1: Try CustomEvent (works if no extension blocks it)
          try {
            window.dispatchEvent(new CustomEvent('open-chat-widget', { 
              detail: { chatRoomId },
              bubbles: true,
              cancelable: true 
            }));
          } catch (e) {
            // Silently catch CustomEvent errors from browser extensions
          }
          
          // Method 2: Direct localStorage flag as fallback
          try {
            localStorage.setItem('prochepro_open_chat', 'true');
            // Trigger storage event for widget
            window.dispatchEvent(new Event('storage'));
          } catch (e) {
            // Final fallback: just reload page with hash
            window.location.href = '/#chat';
          }
        }
      }
    } else if (notification.type === 'new_support_ticket' || notification.type === 'support_ticket_reply' || notification.type === 'support_ticket_status') {
      const ticketId = (notification.data as any)?.ticket_id;
      if (ticketId) {
        // Admins go to admin support page, users go to user support page
        if (currentUser?.role === 'admin' || (currentUser as any)?.is_admin) {
          window.location.href = `/admin/support/${ticketId}`;
        } else {
          window.location.href = `/support/${ticketId}`;
        }
      } else {
        window.location.href = '/support';
      }
    } else if (notification.data?.task_id) {
      window.location.href = `/tasks/${notification.data.task_id}`;
    }
  }

  function getNotificationText(notification: Notification): string {
    if (notification.data?.message) {
      return notification.data.message as string;
    }

    switch (notification.type) {
      case 'referral_bonus':
        return notification.data?.referred_name
          ? `${notification.data.referred_name} a rejoint ProchePro ! +1 crédit`
          : 'Vous avez reçu 1 crédit gratuit !';
      case 'credits_added':
        return notification.data?.message as string || `Vous avez reçu ${notification.data?.amount || ''} crédit(s) gratuit(s) !`;
      case 'offer_accepted':
        return `Votre offre pour "${notification.data?.task_title}" a été acceptée`;
      case 'new_offer':
        return `Nouvelle offre pour "${notification.data?.task_title}"`;
      case 'task_completed':
        return `L'annonce "${notification.data?.task_title}" est terminée`;
      case 'payment_received':
        return `Paiement reçu pour "${notification.data?.task_title}"`;
      case 'chat_message':
        return `Nouveau message de "${(notification.data as any)?.sender_name || 'Support'}"`;
      case 'new_support_ticket':
        return `Nouveau ticket de support: ${(notification.data as any)?.subject || 'Sans titre'}`;
      case 'support_ticket_reply':
        return `Nouvelle réponse sur votre ticket: ${(notification.data as any)?.subject || 'Sans titre'}`;
      case 'support_ticket_status':
        const status = (notification.data as any)?.status;
        const statusLabel = status === 'resolved' ? 'résolu' : status === 'closed' ? 'fermé' : status === 'open' ? 'ouvert' : status;
        return `Votre ticket a été ${statusLabel}: ${(notification.data as any)?.subject || 'Sans titre'}`;
      default:
        return notification.data?.task_title
          ? `Mise à jour: ${notification.data.task_title}`
          : 'Nouvelle notification';
    }
  }

  function getNotificationIcon(type: string): string {
    switch (type) {
      case 'referral_bonus':
        return '🎁';
      case 'offer_accepted':
        return '✅';
      case 'new_offer':
        return '📩';
      case 'task_completed':
        return '🎉';
      case 'payment_received':
        return '💰';
      case 'credits_purchased':
        return '💳';
      case 'credits_added':
        return '🎁';
      case 'chat_message':
        return '💬';
      case 'new_support_ticket':
        return '🎫';
      case 'support_ticket_reply':
        return '💬';
      case 'support_ticket_status':
        return '🔔';
      default:
        return '📢';
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#263238]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 md:px-8 md:justify-between">
          {/* Logo - left */}
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ProchePro logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain -my-1"
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-[#1E293B]">
              ProchePro
            </span>
          </a>

          {/* Mobile: Role switcher + Bell - right */}
          <div className="flex-1 flex items-center justify-end gap-2 md:hidden">
            {/* Mobile role switcher */}
            {currentUser && (
              <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                <button
                  onClick={() => handleSwitchRole("client")}
                  disabled={roleSwitching || (currentUser.active_role || currentUser.role) === "client"}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${(currentUser.active_role || currentUser.role) === "client"
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  👤 Client
                </button>
                <button
                  onClick={() => handleSwitchRole("prestataire")}
                  disabled={roleSwitching || (currentUser.active_role || currentUser.role) === "prestataire"}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${(currentUser.active_role || currentUser.role) === "prestataire"
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  🔧 Pro
                </button>
              </div>
            )}
            {/* Bell notification */}
            <a
              href="/notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
            >
              <span className="text-base leading-none">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </a>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 text-sm font-medium text-slate-600 md:flex">
            <a href="/tasks/browse" className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#1E88E5] transition-colors">
              Annonces
            </a>
            <a href="/tasks/new" className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#1E88E5] transition-colors">
              Publier
            </a>
            <a href="/prestataires" className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#1E88E5] transition-colors">
              Prestataires
            </a>
            <a href="/pricing" className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#1E88E5] transition-colors">
              Tarifs
            </a>
            <a href="/blog" className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#1E88E5] transition-colors">
              Blog
            </a>
            <a href="/community" className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#1E88E5] transition-colors">
              Forum
            </a>
            <a href="/how-it-works" className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#1E88E5] transition-colors">
              Aide
            </a>
          </nav>

          <div className="hidden items-center gap-2 text-sm font-medium md:flex">
            {/* Role switcher */}
            {currentUser && (
              <div className="flex items-center bg-slate-100 rounded-full p-0.5 mr-1">
                <button
                  onClick={() => handleSwitchRole("client")}
                  disabled={roleSwitching || (currentUser.active_role || currentUser.role) === "client"}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${(currentUser.active_role || currentUser.role) === "client"
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  👤 Client
                </button>
                <button
                  onClick={() => handleSwitchRole("prestataire")}
                  disabled={roleSwitching || (currentUser.active_role || currentUser.role) === "prestataire"}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${(currentUser.active_role || currentUser.role) === "prestataire"
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  🔧 Prestataire
                </button>
              </div>
            )}
            {currentUser && (
              <>
                {/* Messages icon */}
                <a
                  href="/messages"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-[#1E88E5] hover:text-[#1E88E5]"
                  title="Messages"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}
                </a>

                {/* Notifications icon */}
                <div ref={notificationsRef} className="relative">
                  <button
                    type="button"
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-[#1E88E5] hover:text-[#1E88E5]"
                    onClick={() => setNotificationsOpen((prev) => !prev)}
                    title="Notifications"
                  >
                    <span className="text-lg leading-none">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl bg-white p-3 text-xs text-slate-800 shadow-lg ring-1 ring-slate-200">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Notifications
                        </span>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsAsRead}
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <p className="px-1 py-2 text-[11px] text-slate-500">
                          Aucune notification pour le moment.
                        </p>
                      ) : (
                        <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                          {notifications.map((n) => {
                            const isUnread = !n.read_at;
                            const icon = getNotificationIcon(n.type);
                            const text = getNotificationText(n);
                            const isExpanded = expandedNotificationId === n.id;
                            const isLongText = text.length > 80;

                            return (
                              <div
                                key={n.id}
                                className={`rounded-xl px-2 py-2 hover:bg-slate-50 ${isUnread ? "bg-slate-50" : "bg-white"
                                  }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    if (isLongText) {
                                      e.stopPropagation();
                                      setExpandedNotificationId(isExpanded ? null : n.id);
                                    } else {
                                      handleNotificationClick(n);
                                    }
                                  }}
                                  className="flex w-full items-start gap-2 text-left"
                                >
                                  <span className="text-base shrink-0">{icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-[11px] font-medium text-slate-800 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                      {text}
                                    </span>
                                    <span className="block mt-0.5 text-[10px] text-slate-400">
                                      {new Date(n.created_at).toLocaleString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  {isUnread && (
                                    <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 mt-1"></span>
                                  )}
                                </button>
                                {isExpanded && (
                                  <button
                                    type="button"
                                    onClick={() => handleNotificationClick(n)}
                                    className="mt-2 ml-6 text-[10px] font-medium text-sky-600 hover:text-sky-700"
                                  >
                                    Voir les détails →
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-2 border-t border-slate-100 pt-2 text-right">
                        <a
                          href="/notifications"
                          className="text-[11px] font-medium text-sky-600 hover:text-sky-700"
                        >
                          Voir toutes les notifications
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {currentUser ? (
              <a
                href="/dashboard"
                className="flex items-center gap-2 rounded-full bg-[#1E88E5] px-3 py-1.5 text-white shadow-sm hover:bg-[#1565C0]"
              >
                <UserAvatar avatar={currentUser.avatar} name={currentUser.name} size="xs" />
                <span className="hidden sm:inline">Mon compte</span>
              </a>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-[#1E88E5] hover:text-[#1E88E5]"
                >
                  Se connecter
                </a>
                <a
                  href="/auth/register"
                  className="hidden rounded-full bg-[#1E88E5] px-4 py-2 text-white shadow-sm hover:bg-[#1565C0] md:inline-flex"
                >
                  S&apos;inscrire
                </a>
              </>
            )}
          </div>

        </div>

      </header>

      {/* Мобільне меню - картка з відступами (винесено за межі header) */}
      {mobileOpen && (
        <>
          {/* Overlay для закриття меню */}
          <div
            className="fixed inset-0 z-[60] md:hidden bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-3 right-3 bottom-20 z-[70] md:hidden bg-white rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto border border-slate-100">
            {/* Handle bar */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full"></div>
            </div>
            <div className="flex flex-col gap-0 px-2 pb-2 text-sm font-medium text-slate-700">
              <a
                href="/prestataires"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-[#1E88E5] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-base">👥</span>
                Prestataires
              </a>
              <a
                href="/pricing"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-[#1E88E5] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-base">💰</span>
                Tarifs
              </a>
              <a
                href="/blog"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-[#1E88E5] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-base">📝</span>
                Blog
              </a>
              <a
                href="/community"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-[#1E88E5] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-base">💬</span>
                Forum
              </a>
              <a
                href="/how-it-works"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-[#1E88E5] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-base">❓</span>
                Comment ça marche
              </a>
              {currentUser ? (
                <>
                  <div className="border-t border-slate-100 my-1 mx-2"></div>
                  <a
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-[#1E88E5] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-base">📊</span>
                    Mon tableau de bord
                  </a>
                  <a
                    href="/profile/edit"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-[#1E88E5] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-base">✏️</span>
                    Modifier le profil
                  </a>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-rose-600 hover:bg-rose-50 transition-colors"
                    onClick={() => {
                      window.localStorage.removeItem("prochepro_user");
                      window.dispatchEvent(new Event("prochepro_logout"));
                      setMobileOpen(false);
                      router.push("/");
                    }}
                  >
                    <span className="text-base">🚪</span>
                    Se déconnecter
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1.5 mt-2 pt-2 px-2 border-t border-slate-100">
                  <a
                    href="/auth/login"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm text-slate-700 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Se connecter
                  </a>
                  <a
                    href="/auth/register"
                    className="rounded-lg bg-[#1E88E5] px-4 py-2 text-center text-sm text-white shadow-sm hover:bg-[#1565C0] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    S&apos;inscrire
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <main className="mx-auto max-w-6xl px-4 py-10 pb-24 md:pb-10 md:px-8 md:py-16">{children}</main>

      <footer className="mt-16 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 md:px-8">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-8">
              {/* Logo & Description */}
              <div>
                <a href="/" className="flex items-center gap-2 mb-3">
                  <Image
                    src="/logo.png"
                    alt="ProchePro"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                  <span className="text-lg font-semibold text-[#0F172A]">ProchePro</span>
                </a>
                <p className="text-sm text-slate-500 leading-relaxed">
                  La plateforme qui connecte les particuliers avec des prestataires de confiance près de chez eux.
                </p>
              </div>

              {/* Aide - centered */}
              <div className="text-center">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-3">Aide</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="/faq" className="hover:text-[#1E88E5] transition-colors">FAQ</a></li>
                  <li><a href="/how-it-works" className="hover:text-[#1E88E5] transition-colors">Comment ça marche</a></li>
                  <li><a href="/blog" className="hover:text-[#1E88E5] transition-colors">Blog</a></li>
                  <li><a href="/how-it-works" className="hover:text-[#1E88E5] transition-colors">Nous contacter</a></li>
                  <li><a href="/about" className="hover:text-[#1E88E5] transition-colors">À propos</a></li>
                </ul>
              </div>

              {/* Légal - centered */}
              <div className="text-center">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-3">Légal</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="/terms" className="hover:text-[#1E88E5] transition-colors">Conditions d&apos;utilisation</a></li>
                  <li><a href="/privacy" className="hover:text-[#1E88E5] transition-colors">Politique de confidentialité</a></li>
                </ul>
                {/* App Store buttons */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setAppStoreModal('google')}
                    className="transition-transform hover:scale-105"
                  >
                    <Image
                      src="/icons/google_play.png"
                      alt="Google Play"
                      width={135}
                      height={40}
                      className="h-10 w-[135px] object-contain"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppStoreModal('apple')}
                    className="transition-transform hover:scale-105"
                  >
                    <Image
                      src="/icons/app_store.png"
                      alt="App Store"
                      width={135}
                      height={40}
                      className="h-10 w-[135px] object-contain"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                © 2025 ProchePro. Tous droits réservés.
              </p>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Logo centered */}
            <div className="flex flex-col items-center text-center mb-6">
              <a href="/" className="flex items-center gap-2 mb-2">
                <Image
                  src="/logo.png"
                  alt="ProchePro"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <span className="text-lg font-semibold text-[#0F172A]">ProchePro</span>
              </a>
              <p className="text-xs text-slate-500 max-w-[250px]">
                Services de confiance près de chez vous
              </p>
            </div>

            {/* Links - centered flex */}
            <div className="flex justify-center gap-12 py-4 border-y border-slate-200">
              <div className="text-center">
                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Aide</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li><a href="/faq" className="hover:text-[#1E88E5]">FAQ</a></li>
                  <li><a href="/how-it-works" className="hover:text-[#1E88E5]">Comment ça marche</a></li>
                  <li><a href="/blog" className="hover:text-[#1E88E5]">Blog</a></li>
                  <li><a href="/how-it-works" className="hover:text-[#1E88E5]">Contact</a></li>
                  <li><a href="/about" className="hover:text-[#1E88E5]">À propos</a></li>
                </ul>
              </div>
              <div className="text-center">
                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Légal</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li><a href="/terms" className="hover:text-[#1E88E5]">CGU</a></li>
                  <li><a href="/privacy" className="hover:text-[#1E88E5]">Confidentialité</a></li>
                </ul>
                {/* App Store buttons - mobile */}
                <div className="flex flex-col items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setAppStoreModal('google')}
                    className="transition-transform hover:scale-105"
                  >
                    <Image
                      src="/icons/google_play.png"
                      alt="Google Play"
                      width={110}
                      height={33}
                      className="h-8 w-[110px] object-contain"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppStoreModal('apple')}
                    className="transition-transform hover:scale-105"
                  >
                    <Image
                      src="/icons/app_store.png"
                      alt="App Store"
                      width={110}
                      height={33}
                      className="h-8 w-[110px] object-contain"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-4 text-center">
              <p className="text-[10px] text-slate-400">
                © {new Date().getFullYear()} ProchePro · Société française
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {/* Home */}
          <a
            href="/"
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${pathname === "/" ? "text-[#1E88E5]" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] mt-0.5">Accueil</span>
          </a>

          {/* Menu hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${mobileOpen ? "text-[#1E88E5]" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            <span className="text-[10px] mt-0.5">Menu</span>
          </button>

          {/* Center button - browse for all, new task only for logged in clients */}
          <a
            href={
              !currentUser
                ? "/tasks/browse"
                : (currentUser?.active_role === "prestataire" || currentUser?.role === "prestataire"
                  ? "/tasks/browse"
                  : "/tasks/new")
            }
            className="flex items-center justify-center w-14 h-14 -mt-4 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white shadow-lg shadow-sky-300/50 hover:shadow-xl transition-all"
          >
            {!currentUser || currentUser?.active_role === "prestataire" || currentUser?.role === "prestataire" ? (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </a>

          {/* Messages */}
          <a
            href="/messages"
            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${pathname?.startsWith("/messages") ? "text-[#1E88E5]" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[10px] mt-0.5">Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-2 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </a>

          {/* Dashboard / Profile */}
          <a
            href={currentUser ? "/dashboard" : "/auth/login"}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${pathname === "/dashboard" ? "text-[#1E88E5]" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {currentUser ? (
              <>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] mt-0.5">Profil</span>
              </>
            ) : (
              <>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-[10px] mt-0.5">Connexion</span>
              </>
            )}
          </a>
        </div>
      </nav>

      {/* App Store Coming Soon Modal */}
      {appStoreModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setAppStoreModal(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAppStoreModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex justify-center">
                {appStoreModal === 'google' ? (
                  <Image
                    src="/icons/google_play.png"
                    alt="Google Play"
                    width={160}
                    height={48}
                    className="h-12 w-auto"
                  />
                ) : (
                  <Image
                    src="/icons/app_store.png"
                    alt="App Store"
                    width={160}
                    height={48}
                    className="h-12 w-auto"
                  />
                )}
              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {appStoreModal === 'google' ? 'Google Play' : 'App Store'}
              </h3>

              <div className="mb-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 p-4">
                <p className="text-sm font-medium text-slate-700">
                  {appStoreModal === 'google'
                    ? '🚀 Bientôt disponible'
                    : '🍎 Bientôt disponible'
                  }
                </p>
              </div>

              <p className="mb-5 text-xs text-slate-500">
                {appStoreModal === 'google'
                  ? "L'application ProchePro sera bientôt disponible sur Google Play. Restez connecté !"
                  : "L'application iOS est en cours de développement. Nous vous tiendrons informé de sa sortie."
                }
              </p>

              <button
                type="button"
                onClick={() => setAppStoreModal(null)}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-sky-600 hover:to-indigo-600 transition-all"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      <InstallPWA />
    </div>
  );
}
