'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, MessageCircle, Minimize2 } from 'lucide-react';

// Add animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
`;
import axios from 'axios';

interface Message {
  id: number;
  user_id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface FaqMessage {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatRoom {
  id: number;
  status: string;
  unread_user_count: number;
}

interface LiveChatWidgetProps {
  isLoggedIn: boolean;
}

export default function LiveChatWidget({ isLoggedIn }: LiveChatWidgetProps) {
  const pathname = usePathname();
  
  // Не показувати чат на сторінках /messages/*
  if (pathname && pathname.startsWith('/messages')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [viewMode, setViewMode] = useState<'faq' | 'faq-chat' | 'live-chat'>('faq');
  const [messages, setMessages] = useState<Message[]>([]);
  const [faqMessages, setFaqMessages] = useState<FaqMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const userTypingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const FAQ_DATA = [
    { 
      q: "Comment publier une annonce?", 
      a: "Pour publier une annonce sur ProchePro:\n\n1️⃣ Cliquez sur le bouton 'Publier' en haut à droite\n2️⃣ Sélectionnez votre catégorie de service\n3️⃣ Remplissez tous les détails (titre, description, prix)\n4️⃣ Ajoutez des photos de qualité (recommandé)\n5️⃣ Vérifiez et publiez!\n\nVotre annonce sera visible immédiatement. 🎉",
      category: "publication"
    },
    { 
      q: "Comment contacter un prestataire?", 
      a: "Pour contacter un prestataire:\n\n1️⃣ Accédez au profil du prestataire\n2️⃣ Cliquez sur 'Contacter' ou 'Envoyer un message'\n3️⃣ Rédigez votre demande avec tous les détails\n4️⃣ Le prestataire recevra une notification\n\nVous pouvez aussi appeler directement si le numéro est affiché. 📞",
      category: "contact"
    },
    { 
      q: "Tarifs et abonnements", 
      a: "💰 Nos tarifs ProchePro:\n\n✅ Publication gratuite - Annonces de base sans frais\n\n⭐ Premium (9.99€/mois):\n• Mise en avant de vos annonces\n• Badge 'Professionnel vérifié'\n• Support prioritaire\n• Statistiques détaillées\n\n🏆 Business (29.99€/mois):\n• Tout Premium +\n• Annonces illimitées\n• Top position dans les résultats\n• Account manager dédié",
      category: "pricing"
    },
    { 
      q: "Problème de paiement", 
      a: "Si vous rencontrez un problème de paiement:\n\n1️⃣ Vérifiez que votre carte est valide et non expirée\n2️⃣ Assurez-vous d'avoir suffisamment de fonds\n3️⃣ Essayez une autre carte bancaire\n4️⃣ Essayez PayPal comme alternative\n\n⚠️ Si le problème persiste, contactez directement notre équipe avec le code d'erreur affiché.",
      category: "payment"
    },
    { 
      q: "Modifier ou supprimer mon annonce", 
      a: "Pour gérer vos annonces:\n\n📝 Modifier:\n1️⃣ Allez dans 'Mon Profil' → 'Mes Annonces'\n2️⃣ Cliquez sur l'icône ✏️ (crayon)\n3️⃣ Modifiez et sauvegardez\n\n🗑️ Supprimer:\n1️⃣ Allez dans 'Mes Annonces'\n2️⃣ Cliquez sur l'icône 🗑️ (poubelle)\n3️⃣ Confirmez la suppression\n\nLes modifications sont instantanées!",
      category: "manage"
    },
  ];

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.prochepro.fr'}/api`;

  // Listen for multiple methods to open chat (avoid extension blocking)
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
      // Clear the flag
      try {
        localStorage.removeItem('prochepro_open_chat');
      } catch (e) {
        // Ignore
      }
    };
    
    // Method 1: CustomEvent listener
    window.addEventListener('open-chat-widget', handleOpenChat);
    
    // Method 2: Storage event listener (fallback for mobile)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'prochepro_open_chat' || !e.key) {
        const shouldOpen = localStorage.getItem('prochepro_open_chat');
        if (shouldOpen === 'true') {
          handleOpenChat();
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Method 3: Check on mount (for hash-based opening)
    if (window.location.hash === '#chat') {
      handleOpenChat();
      // Clean up hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    // Method 4: Check localStorage on mount
    const shouldOpen = localStorage.getItem('prochepro_open_chat');
    if (shouldOpen === 'true') {
      handleOpenChat();
    }
    
    return () => {
      window.removeEventListener('open-chat-widget', handleOpenChat);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Initialize chat room
  useEffect(() => {
    if (isOpen && !room) {
      initChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, room]);

  // Auto-scroll to bottom only if user is at bottom
  useEffect(() => {
    if (!isUserTyping) {
      scrollToBottomIfNeeded();
    }
  }, [messages]);

  // Setup WebSocket connection with Reverb + polling fallback
  useEffect(() => {
    if (!room?.id || typeof window === 'undefined') return;

    let echoInstance: any = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    // Try WebSocket
    import('@/lib/echo-chat').then(({ default: Echo }) => {
      if (Echo) {
        echoInstance = Echo;
        Echo.channel(`chat.${room.id}`)
          .listen('.message.sent', (event: any) => {
            setMessages(prev => {
              if (prev.some(m => m.id === event.id)) return prev;
              return [...prev, event];
            });
            setUnreadCount(0);
            scrollToBottom();
          })
          .listen('.user.typing', (event: any) => {
            const currentUserId = getCurrentUserId();
            if (event.user_id !== currentUserId) {
              setIsTyping(event.is_typing);
            }
          });
      }
    }).catch(() => {
      // WebSocket unavailable, using polling
    });

    // Polling fallback every 5 seconds when chat is open (but not when user is typing)
    if (isOpen && !isMinimized && viewMode === 'live-chat') {
      pollingInterval = setInterval(async () => {
        // Skip polling if user is actively typing
        if (isUserTyping) return;
        
        try {
          const token = localStorage.getItem('prochepro_token');
          const response = await axios.get(`${API_URL}/chat/room/${room.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const newMessages = response.data.data || [];
          setMessages(prev => {
            // Only update if there are actually new messages
            if (newMessages.length > prev.length) {
              return newMessages;
            }
            return prev;
          });
        } catch (error) {
          // Silent fail
        }
      }, 5000);
    }

    return () => {
      if (echoInstance) {
        echoInstance.leave(`chat.${room.id}`);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [room?.id, isOpen, isMinimized, viewMode, isUserTyping]);

  const getCurrentUserId = () => {
    if (typeof window === 'undefined') return null;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return null;
    }
  };

  const isScrolledToBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottomIfNeeded = () => {
    if (isScrolledToBottom()) {
      scrollToBottom();
    }
  };

  const handleFaqClick = (faq: {q: string; a: string; category?: string}) => {
    // Switch to FAQ chat mode
    setViewMode('faq-chat');
    
    // Add user question
    const userMsg: FaqMessage = {
      id: `user-${Date.now()}`,
      message: faq.q,
      isBot: false,
      timestamp: new Date(),
    };
    setFaqMessages([userMsg]);
    
    // Simulate bot typing and response
    setIsBotTyping(true);
    setTimeout(() => {
      const botMsg: FaqMessage = {
        id: `bot-${Date.now()}`,
        message: faq.a,
        isBot: true,
        timestamp: new Date(),
      };
      setFaqMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);
      scrollToBottom();
    }, 1200); // Realistic typing delay
  };

  const initChat = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('prochepro_token');
      
      // Get or create room
      const roomResponse = await axios.get(`${API_URL}/chat/room`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const chatRoom = roomResponse.data.room;
      setRoom(chatRoom);
      setUnreadCount(chatRoom.unread_user_count || 0);

      // Get messages
      const messagesResponse = await axios.get(`${API_URL}/chat/room/${chatRoom.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(messagesResponse.data.data || []);
      setUnreadCount(0);
    } catch (error) {
      // Failed to init chat
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !room) return;

    try {
      const token = localStorage.getItem('prochepro_token');
      const response = await axios.post(
        `${API_URL}/chat/room/${room.id}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      stopTyping();
    } catch (error) {
      // Failed to send message
    }
  };

  const handleTyping = () => {
    if (!room) return;

    // Mark user as typing locally
    setIsUserTyping(true);
    if (userTypingTimeoutRef.current) {
      clearTimeout(userTypingTimeoutRef.current);
    }
    userTypingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 2000);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    const token = localStorage.getItem('prochepro_token');
    axios.post(
      `${API_URL}/chat/room/${room.id}/typing`,
      { is_typing: true },
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => {});

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(stopTyping, 3000);
  };

  const stopTyping = () => {
    if (!room) return;

    const token = localStorage.getItem('prochepro_token');
    axios.post(
      `${API_URL}/chat/room/${room.id}/typing`,
      { is_typing: false },
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => {});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 max-md:bottom-20 max-md:right-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 group"
        aria-label="Ouvrir le chat"
      >
        <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 
      bottom-6 right-6 md:bottom-6 md:right-6
      max-md:bottom-20 max-md:right-4
      ${isMinimized ? 'w-[300px] max-md:w-[280px]' : 'w-[340px] max-md:w-[320px]'}`}>
      {/* Chat Window */}
      <div className={`bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col ${
        isMinimized ? 'h-12' : 'h-[440px] max-md:h-[380px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle size={14} />
            </div>
            <div>
              <h3 className="text-xs font-semibold">Support ProchePro</h3>
              <p className="text-[9px] text-white/80">En ligne • Réponse rapide</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/10 p-1 rounded transition"
              aria-label="Minimiser"
            >
              <Minimize2 size={14} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded transition"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {viewMode === 'faq' ? (
              /* FAQ View */
              <div className="flex-1 overflow-y-auto p-3 bg-gradient-to-br from-sky-50 via-white to-blue-50">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl shadow-lg mb-2.5 animate-pulse">
                      <MessageCircle className="text-white" size={18} />
                    </div>
                    <h3 className="text-sm font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-1">Comment pouvons-nous vous aider?</h3>
                    <p className="text-[10px] text-gray-500">Choisissez un sujet ou contactez notre équipe</p>
                  </div>
                  
                  <div className="space-y-1.5 mb-4">
                    {FAQ_DATA.map((faq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFaqClick(faq)}
                        className="group w-full text-left p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-sky-400 hover:scale-[1.01] transform relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex items-start gap-2">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-xs">{['📝', '💬', '💰', '💳', '⚙️'][idx]}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-semibold text-gray-800 group-hover:text-sky-600 transition-colors leading-snug">{faq.q}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 rounded-lg blur opacity-25"></div>
                    <button
                      onClick={() => {
                        const token = localStorage.getItem('prochepro_token');
                        if (!token) {
                          setShowLoginModal(true);
                          return;
                        }
                        setViewMode('live-chat');
                        if (!room) initChat();
                      }}
                      className="relative w-full py-2 px-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle size={14} />
                      <span>Parler avec un opérateur</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : viewMode === 'faq-chat' ? (
              /* FAQ Bot Chat View */
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30">
                {faqMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {msg.isBot ? (
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-sky-100">
                          <span className="text-white text-xs">🤖</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[10px] font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Assistant ProchePro</p>
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-semibold rounded-full">En ligne</span>
                          </div>
                          <div className="bg-white rounded-xl rounded-tl-none px-3 py-2.5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                            <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                              {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[80%]">
                        <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2.5 shadow-md hover:shadow-lg transition-all">
                          <p className="text-xs whitespace-pre-wrap leading-relaxed font-medium">{msg.message}</p>
                          <p className="text-[10px] text-white/70 mt-1.5 flex items-center justify-end gap-1">
                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            <span className="w-0.5 h-0.5 bg-white/70 rounded-full"></span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-sky-100 animate-pulse">
                        <span className="text-white text-xs">🤖</span>
                      </div>
                      <div className="bg-white rounded-xl rounded-tl-none px-4 py-2.5 shadow-md border border-gray-100">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />

                {/* Action buttons after bot response */}
                {faqMessages.length > 0 && !isBotTyping && (
                  <div className="flex flex-col gap-2 pt-3 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                      <button
                        onClick={() => {
                          const token = localStorage.getItem('prochepro_token');
                          if (!token) {
                            setShowLoginModal(true);
                            return;
                          }
                          setViewMode('live-chat');
                          if (!room) initChat();
                        }}
                        className="relative w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle size={14} />
                        <span>Parler avec un opérateur</span>
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setFaqMessages([]);
                        setViewMode('faq');
                      }}
                      className="w-full py-2 px-4 bg-white text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 flex items-center justify-center gap-1.5 group"
                    >
                      <span className="group-hover:-translate-x-1 transition-transform">←</span>
                      <span>Retour aux questions</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Live Chat View */
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30">
              <style>{styles}</style>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-200 border-t-sky-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MessageCircle size={14} className="text-sky-600" />
                    </div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                  <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <MessageCircle size={24} className="text-sky-600" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1.5">Bienvenue! 👋</h4>
                  <p className="text-xs text-gray-500 max-w-xs">Notre équipe est prête à vous aider. Posez votre question!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {msg.is_admin ? (
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-purple-100">
                          <span className="text-white text-xs">👨‍💻</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[10px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{msg.user.name}</p>
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-semibold rounded-full">Support</span>
                          </div>
                          <div className="bg-white rounded-xl rounded-tl-none px-3 py-2.5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                            <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[80%]">
                        <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2.5 shadow-md hover:shadow-lg transition-all">
                          <p className="text-xs whitespace-pre-wrap leading-relaxed font-medium">{msg.message}</p>
                          <p className="text-[10px] text-white/70 mt-1.5 flex items-center justify-end gap-1">
                            {formatTime(msg.created_at)}
                            <span className="w-0.5 h-0.5 bg-white/70 rounded-full"></span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-purple-100 animate-pulse">
                      <span className="text-white text-xs">👨‍💻</span>
                    </div>
                    <div className="bg-white rounded-xl rounded-tl-none px-4 py-2.5 shadow-md border border-gray-100">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            )}

            {/* Input - only show in live chat mode */}
            {viewMode === 'live-chat' && (
            <div className="p-2.5 bg-white border-t">
              <div className="flex items-end gap-1.5">
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent max-h-24"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Envoyer"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center justify-between">
                <span>Réponse en ~5 min</span>
                <button
                  onClick={() => setViewMode('faq')}
                  className="text-sky-600 hover:text-sky-700 font-medium text-[10px]"
                >
                  ← FAQ
                </button>
              </p>
            </div>
            )}
          </>
        )}
      </div>

      {/* Login Modal для гостей */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Connexion requise</h3>
              <p className="text-sm text-gray-600 mb-6">
                Pour parler avec un opérateur, vous devez vous connecter ou créer un compte.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="/connexion"
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Se connecter
                </a>
                <a
                  href="/inscription"
                  className="w-full py-3 px-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200"
                >
                  Créer un compte
                </a>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
