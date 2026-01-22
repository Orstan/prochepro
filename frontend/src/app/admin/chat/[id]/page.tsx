'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Paperclip, Image as ImageIcon, File, X, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const fadeInStyle = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

interface Message {
  id: number;
  user_id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
  type?: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
  user: {
    name: string;
    avatar?: string;
  };
}

interface ChatRoom {
  id: number;
  user: { id: number; name: string; email: string };
  status: string;
  priority: string;
  category: string;
}

export default function AdminChatRoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userTypingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const shouldAutoScrollRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.prochepro.fr'}/api`;
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.prochepro.fr';

  useEffect(() => {
    fetchRoom();
    fetchMessages(true);
    
    // Mark messages as read when opening chat
    markAsRead();
  }, [roomId]);

  useEffect(() => {
    // Only auto-scroll if shouldAutoScrollRef is true (user sent message or is at bottom)
    if (shouldAutoScrollRef.current && messages.length > 0) {
      scrollToBottom();
      shouldAutoScrollRef.current = false;
    }
  }, [messages]);

  // Setup WebSocket for real-time messages
  useEffect(() => {
    if (!roomId) return;

    let echoInstance: any = null;

    // Try to setup WebSocket
    import('@/lib/echo-chat').then(({ default: Echo }) => {
      if (Echo) {
        echoInstance = Echo;
        Echo.channel(`chat.${roomId}`)
          .listen('.message.sent', (event: any) => {
            setMessages(prev => {
              if (prev.some(m => m.id === event.id)) return prev;
              shouldAutoScrollRef.current = isUserNearBottom();
              return [...prev, event];
            });
            markAsRead();
          });
      }
    }).catch(() => {
      // WebSocket failed, use polling fallback
      console.log('WebSocket unavailable, using polling');
    });

    // Polling fallback every 3 seconds (skip if user is typing)
    const pollingInterval = setInterval(() => {
      if (!isUserTyping) {
        fetchMessages();
      }
    }, 3000);

    return () => {
      if (echoInstance) {
        echoInstance.leave(`chat.${roomId}`);
      }
      clearInterval(pollingInterval);
    };
  }, [roomId, isUserTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isUserNearBottom = (): boolean => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom < 150;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
      setShowAttachMenu(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem('prochepro_token');
      const response = await axios.get(`${API_URL}/admin/chat/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(response.data);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    }
  };

  const fetchMessages = async (isInitial = false) => {
    try {
      if (isInitial) setIsInitialLoading(true);
      const token = localStorage.getItem('prochepro_token');
      const response = await axios.get(`${API_URL}/chat/room/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
        setIsLoading(false);
      }
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('prochepro_token');
      await axios.post(
        `${API_URL}/chat/room/${roomId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      // Silent fail - not critical
    }
  };

  const handleTyping = () => {
    setIsUserTyping(true);
    if (userTypingTimeoutRef.current) {
      clearTimeout(userTypingTimeoutRef.current);
    }
    userTypingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsUserTyping(false);
    shouldAutoScrollRef.current = true;
    
    // Save current values before clearing
    const messageText = newMessage;
    const filesToSend = [...attachments];
    
    // Clear immediately for better UX
    setNewMessage('');
    setAttachments([]);
    
    try {
      const token = localStorage.getItem('prochepro_token');
      
      if (filesToSend.length > 0) {
        const formData = new FormData();
        formData.append('message', messageText);
        filesToSend.forEach((file) => {
          formData.append('attachments[]', file);
        });
        
        const response = await axios.post(
          `${API_URL}/chat/room/${roomId}/messages`,
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        setMessages(prev => [...prev, response.data]);
      } else {
        const response = await axios.post(
          `${API_URL}/chat/room/${roomId}/messages`,
          { message: messageText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore on error
      setNewMessage(messageText);
      setAttachments(filesToSend);
    }
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

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fadeInStyle }} />
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
        {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-2 sm:px-3 py-1.5 sm:py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link href="/admin/chat" className="flex-shrink-0 text-slate-600 hover:text-sky-600 hover:bg-sky-50 p-1.5 rounded-lg transition">
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{room?.user.name}</h1>
                <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">{room?.user.email}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold whitespace-nowrap ${
                room?.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                room?.status === 'assigned' ? 'bg-sky-100 text-sky-700' :
                room?.status === 'resolved' ? 'bg-purple-100 text-purple-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {room?.status}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold whitespace-nowrap ${
                room?.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                room?.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {room?.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 flex flex-col justify-end"
      >
        <div className="w-full space-y-1 sm:space-y-1.5 py-1.5 sm:py-2">
          {messages.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-full bg-slate-100 flex items-center justify-center">
                <Send size={18} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-[11px]">Aucun message pour le moment</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-1.5 ${
                  msg.is_admin ? 'justify-end' : 'justify-start'
                } animate-fadeIn`}
              >
                {/* Avatar for user messages */}
                {!msg.is_admin && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold flex-shrink-0">
                    {msg.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Message bubble */}
                <div
                  className={`rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 max-w-[75%] sm:max-w-[65%] ${
                    msg.is_admin
                      ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-800 shadow-md border border-slate-200'
                  }`}
                >
                  {/* User name INSIDE bubble for user messages */}
                  {!msg.is_admin && (
                    <p className="text-[9px] sm:text-[10px] font-bold text-sky-600 mb-1">
                      {msg.user.name}
                    </p>
                  )}
                  
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-1.5">
                      {msg.attachments.map((att, idx) => {
                        // Debug
                        console.log('Attachment:', att);
                        
                        const isImage = att.type?.startsWith('image/') || 
                                       att.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
                        
                        // Full URL (attachments from backend have /storage/ prefix)
                        const fullUrl = att.url?.startsWith('http') 
                          ? att.url 
                          : `${BASE_URL}${att.url}`;
                        
                        console.log('isImage:', isImage, 'fullUrl:', fullUrl);
                        
                        return (
                          <div key={idx} className="mb-1 last:mb-0">
                            {isImage ? (
                              <img
                                src={fullUrl}
                                alt={att.name}
                                className="max-w-[250px] max-h-[200px] w-auto h-auto object-cover rounded cursor-pointer hover:opacity-90 hover:scale-[1.02] transition shadow-sm"
                                onClick={() => window.open(fullUrl, '_blank')}
                                onError={(e) => {
                                  console.error('Image load error:', fullUrl);
                                  e.currentTarget.style.display = 'none';
                                }}
                                title="Клікни щоб відкрити в повному розмірі"
                              />
                            ) : (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 p-1.5 rounded ${
                                  msg.is_admin ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 hover:bg-slate-100'
                                }`}
                              >
                                <File size={14} className={msg.is_admin ? 'text-white' : 'text-slate-600'} />
                                <span className="text-[9px] sm:text-[10px] truncate max-w-[150px]">
                                  {att.name}
                                </span>
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Text message */}
                  {msg.message && (
                    <p className="text-[10px] sm:text-[11px] whitespace-pre-wrap leading-snug">
                      {msg.message}
                    </p>
                  )}
                  
                  {/* Timestamp */}
                  <div className={`flex items-center gap-0.5 mt-1 ${
                    msg.is_admin ? 'justify-end' : 'justify-start'
                  }`}>
                    <p className={`text-[7px] sm:text-[8px] ${
                      msg.is_admin ? 'text-white/70' : 'text-slate-400'
                    }`}>
                      {formatTime(msg.created_at)}
                    </p>
                    {msg.is_admin && (
                      <CheckCheck size={9} className="text-white/70" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="w-full px-2 sm:px-4 md:px-6 py-1.5">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex gap-1.5 mb-1.5 overflow-x-auto pb-1">
              {attachments.map((file, idx) => (
                <div key={idx} className="relative flex-shrink-0 group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <File size={20} className="text-slate-400" />
                    )}
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={10} />
                  </button>
                  <p className="text-[8px] text-slate-500 mt-0.5 truncate max-w-[56px] sm:max-w-[64px]">{file.name}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-1.5">
            {/* Attach Button */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-1.5 sm:p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
              >
                <Paperclip size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-1.5 bg-white rounded-lg shadow-xl border border-slate-200 p-1.5 min-w-[140px] z-10">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-700 hover:bg-sky-50 rounded-md transition"
                  >
                    <ImageIcon size={14} className="text-sky-600" />
                    <span>Photo/Vidéo</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-700 hover:bg-sky-50 rounded-md transition"
                  >
                    <File size={14} className="text-slate-600" />
                    <span>Document</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* File input - outside conditional to stay in DOM */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="flex-1 resize-none border border-slate-300 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent max-h-24 placeholder:text-slate-400"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              className="bg-gradient-to-br from-sky-500 to-blue-600 text-white p-2 sm:p-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
              aria-label="Envoyer"
            >
              <Send size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
