"use client";

import { useEffect, useState, useRef, FormEvent, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { getEcho } from "@/lib/echo";
import UserAvatar from "@/components/UserAvatar";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface Message {
  id: number;
  task_id: number;
  sender_id: number;
  body: string;
  is_read?: boolean;
  read_at?: string | null;
  created_at: string;
  sender?: { id: number; name: string; avatar?: string | null };
}

interface Task {
  id: number;
  title: string;
  status: string;
  client_id: number;
  client?: { id: number; name: string; avatar?: string | null };
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [otherUser, setOtherUser] = useState<{ id: number; name: string; avatar?: string | null } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const echoChannelRef = useRef<any>(null);
  const { playSound } = useNotificationSound();
  const pushNotifications = usePushNotifications();
  const isInitialLoadRef = useRef<boolean>(true);
  const shouldScrollRef = useRef<boolean>(false);

  // Show PWA notification
  const showPWANotification = useCallback((message: Message, sender: { name: string; avatar?: string | null }) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${sender.name}`, {
        body: message.body.substring(0, 100),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: `message-${message.id}`,
        requireInteraction: false,
      } as NotificationOptions);
      
      notification.onclick = function() {
        window.focus();
        this.close();
      };
    }
  }, [taskId]);

  // Handle new message from WebSocket
  const handleNewMessage = useCallback((event: { message: Message }) => {
    const newMsg = event.message;
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === newMsg.id)) {
        return prev;
      }
      return [...prev, newMsg];
    });
    
    // Play sound and show notification if message is from other user
    if (newMsg.sender_id !== user?.id) {
      playSound();
      
      // Show PWA notification if supported and page is not focused
      if (pushNotifications.isSupported && !document.hasFocus() && otherUser) {
        showPWANotification(newMsg, otherUser);
      }
      
      // Mark as read automatically after 2 seconds
      setTimeout(() => {
        if (typeof markMessageAsRead === 'function') {
          markMessageAsRead(newMsg.id, user || undefined);
        }
      }, 2000);
    }
  }, [user?.id, playSound, pushNotifications.isSupported, otherUser, showPWANotification]);

  // Handle typing indicator
  const handleUserTyping = useCallback((event: { user_id: number; is_typing: boolean }) => {
    if (event.user_id !== user?.id) {
      setOtherUserTyping(event.is_typing);
    }
  }, [user?.id]);

  // Handle message read
  const handleMessageRead = useCallback((event: { message_id: number; user_id: number; read_at: string }) => {
    if (event.user_id !== user?.id) {
      setMessages(prev => prev.map(msg => 
        msg.id === event.message_id 
          ? { ...msg, is_read: true, read_at: event.read_at }
          : msg
      ));
    }
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Block page scroll on mobile, keep normal on desktop
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      
      // Hide footer on mobile only
      const footer = document.querySelector('footer');
      if (footer) {
        (footer as HTMLElement).style.display = 'none';
      }
    }

    // Add global CSS to hide chat bot - most aggressive approach
    const styleId = 'hide-chat-bot-style';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.innerHTML = `
        #live-chat-widget,
        [id*="live-chat"],
        [id*="livechat"],
        [class*="live-chat"],
        [class*="livechat"],
        [class*="chat-widget"],
        [class*="chatwidget"],
        iframe[src*="tawk"],
        iframe[src*="crisp"],
        .crisp-client,
        #crisp-chatbox,
        [id*="tawk"],
        [class*="tawk"],
        div[style*="z-index: 2147483647"],
        div[style*="z-index: 999999"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    // Hide chat bot - multiple approaches for reliability
    const hideChatBot = () => {
      const selectors = [
        '#live-chat-widget',
        '[id*="live-chat"]',
        '[id*="livechat"]',
        '[class*="live-chat"]',
        '[class*="livechat"]',
        '[class*="chat-widget"]',
        '[class*="chatwidget"]',
        'iframe[src*="tawk"]',
        'iframe[src*="crisp"]',
        '.crisp-client',
        '#crisp-chatbox',
        '[id*="tawk"]',
        '[class*="tawk"]'
      ];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            (el as HTMLElement).style.setProperty('display', 'none', 'important');
            (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
            (el as HTMLElement).style.setProperty('opacity', '0', 'important');
            (el as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
            (el as HTMLElement).remove(); // Remove completely
          });
        } catch (e) {
          // Ignore errors
        }
      });
    };
    
    // Hide immediately
    hideChatBot();
    
    // Hide again after delays
    setTimeout(hideChatBot, 100);
    setTimeout(hideChatBot, 500);
    setTimeout(hideChatBot, 1000);
    setTimeout(hideChatBot, 2000);
    
    // MutationObserver to watch for dynamically added chat widgets
    const observer = new MutationObserver(() => {
      hideChatBot();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      fetchTaskAndMessages(parsed);
      
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Try to connect to WebSocket
      const echo = getEcho();
      if (echo) {
        try {
          echoChannelRef.current = echo.private(`task.${taskId}`);
          echoChannelRef.current
            .listen(".NewMessage", handleNewMessage)
            .listen(".UserTyping", handleUserTyping)
            .listen(".MessageRead", handleMessageRead);
        } catch (err) {
          // WebSocket connection failed, falling back to polling
        }
      }
      
      // Fallback: Poll for new messages every 5 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages();
      }, 5000);
    } catch {
      router.replace("/auth/login");
    }

    return () => {
      // Restore page scroll and footer
      document.body.style.overflow = '';
      document.body.style.height = '';
      
      // Show footer (restore for all devices)
      const footer = document.querySelector('footer');
      if (footer) {
        (footer as HTMLElement).style.display = '';
      }

      // Remove global CSS
      const styleTag = document.getElementById('hide-chat-bot-style');
      if (styleTag) {
        styleTag.remove();
      }
      
      // Disconnect observer
      if (observer) {
        observer.disconnect();
      }

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      // Cleanup WebSocket
      if (echoChannelRef.current) {
        echoChannelRef.current
          .stopListening(".NewMessage")
          .stopListening(".UserTyping")
          .stopListening(".MessageRead");
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, taskId]);

  useEffect(() => {
    // Скролити тільки при першому завантаженні або після відправки власного повідомлення
    if (isInitialLoadRef.current || shouldScrollRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchTaskAndMessages(currentUser: User) {
    setLoading(true);
    try {
      // Fetch task
      const taskRes = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
      if (!taskRes.ok) {
        router.replace("/messages");
        return;
      }
      const taskData = await taskRes.json();
      setTask(taskData);

      // Determine other user
      if (currentUser.role === "client") {
        // Get accepted offer prestataire
        const offerRes = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/offers`);
        if (offerRes.ok) {
          const offers = await offerRes.json();
          // Find accepted offer
          const acceptedOffer = offers.find((o: any) => o.status === 'accepted');
          if (acceptedOffer?.prestataire) {
            setOtherUser(acceptedOffer.prestataire);
          }
        }
      } else {
        // Prestataire sees client
        setOtherUser(taskData.client || { id: taskData.client_id, name: "Client" });
      }

      // Fetch messages
      await fetchMessages(currentUser);
      
      // Після першого завантаження скролимо вниз, потім вимикаємо автоскрол
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    } catch (err) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(currentUser?: User) {
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/messages`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const newMessages = data ?? [];
        
        // Use currentUser parameter or fallback to state
        const activeUser = currentUser || user;
        
        // Play sound if new message from other user
        if (newMessages.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.sender_id !== activeUser?.id) {
            playSound();
          }
        }
        lastMessageCountRef.current = newMessages.length;
        
        setMessages(newMessages);
        
        // Mark all unread messages from other user as read
        if (activeUser) {
          const unreadMessages = newMessages.filter((msg: any) => 
            msg.sender_id !== activeUser.id && (!msg.is_read || msg.is_read === false)
          );
          
          // Mark each unread message as read
          for (const msg of unreadMessages) {
            markMessageAsRead(msg.id, activeUser);
          }
        }
      }
    } catch (err) {
      // Error fetching messages
    }
  }

  function handleInputChange(value: string) {
    setNewMessage(value);
    
    // Send typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  }

  async function sendTypingIndicator(typing: boolean) {
    // Typing indicator через WebSocket, HTTP endpoint не існує
    if (!user) return;
    // TODO: Реалізувати через WebSocket якщо потрібно
  }

  async function markMessageAsRead(messageId: number, currentUser?: User) {
    const activeUser = currentUser || user;
    
    if (!activeUser) return;
    
    try {
      const token = localStorage.getItem("prochepro_token");
      await fetch(`${API_BASE_URL}/api/tasks/${taskId}/messages/${messageId}/read`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
    } catch (err) {
      // Silent fail
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending) return;

    // Зберігаємо текст локально і одразу очищаємо поле
    const messageToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);
    setIsTyping(false);
    sendTypingIndicator(false);
    
    try {
      const token = localStorage.getItem("prochepro_token");
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          body: messageToSend,
        }),
      });

      if (res.ok) {
        const msg = await res.json();
        shouldScrollRef.current = true;
        setMessages((prev) => [...prev, msg]);
      } else {
        // Якщо помилка - повертаємо текст назад
        setNewMessage(messageToSend);
      }
    } catch (err) {
      // Error sending message - повертаємо текст назад
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  }


  if (!user) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
        <p className="mt-2 text-sm text-slate-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-[64px] bottom-[60px] left-0 right-0 md:relative md:w-full md:min-h-[calc(100vh-200px)] md:h-auto flex flex-col bg-white md:max-w-4xl md:mx-auto overflow-hidden md:rounded-lg md:shadow-sm md:mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3.5 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.push("/messages")}
          className="p-2.5 hover:bg-slate-100 rounded-full active:bg-slate-200 transition-colors touch-manipulation flex-shrink-0"
        >
          <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {otherUser && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <UserAvatar avatar={otherUser.avatar} name={otherUser.name} size="sm" className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-slate-900 text-base md:text-lg">{otherUser.name}</h2>
              {otherUserTyping && (
                <p className="text-xs text-sky-600 italic">Tape un message...</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col justify-end min-h-full space-y-2 px-3 py-4 md:px-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-sm text-slate-600">
                Commencez la conversation avec {otherUser?.name}
              </p>
            </div>
          ) : (
            messages
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((msg) => {
            const isOwn = msg.sender_id === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end gap-2 max-w-[80%] md:max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && (
                    <UserAvatar 
                      avatar={msg.sender?.avatar} 
                      name={msg.sender?.name || "User"} 
                      size="xs" 
                    />
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl ${
                      isOwn
                        ? "bg-sky-500 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-[10px] ${
                          isOwn ? "text-sky-100" : "text-slate-400"
                        }`}>
                        {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {isOwn && (
                        <span className="text-[10px] text-sky-100" title={msg.is_read ? "Lu" : "Envoyé"}>
                          {msg.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                      {!isOwn && !msg.is_read && (
                        <span className="inline-block w-2 h-2 bg-sky-500 rounded-full" title="Nouveau"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-slate-200 bg-white px-3 py-3 md:py-4 safe-area-inset-bottom">
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Écrivez votre message..."
            className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-[15px] md:text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-shadow touch-manipulation"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="inline-flex items-center justify-center h-11 w-11 md:h-10 md:w-10 rounded-full bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation flex-shrink-0"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
