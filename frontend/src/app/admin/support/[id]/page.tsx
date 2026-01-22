'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface Message {
  id: number;
  user_id: number;
  message: string;
  is_internal: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    is_admin?: boolean;
  };
}

interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  messages: Message[];
}

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;
  
  const [user, setUser] = useState<any>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem('prochepro_user');
    if (!stored) {
      router.replace('/auth/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed.is_admin) {
        alert('Accès refusé');
        router.replace('/dashboard');
        return;
      }
      setUser(parsed);
      fetchTicket();
    } catch {
      router.replace('/auth/login');
    }
  }, [router, ticketId]);

  function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('prochepro_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async function fetchTicket() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          message: newMessage,
          is_internal: isInternal 
        }),
      });

      if (res.ok) {
        setNewMessage('');
        setIsInternal(false);
        fetchTicket();
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur de connexion au serveur');
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function handlePriorityChange(newPriority: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ priority: newPriority }),
      });

      if (res.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Ticket introuvable</p>
          <button
            onClick={() => router.push('/admin/support')}
            className="mt-4 text-sky-600 hover:text-sky-700"
          >
            Retour aux tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/support')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors group"
          >
            <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour aux tickets</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                  {ticket.subject}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-3">
                  <span className="font-medium">{ticket.user.name}</span>
                  <span>•</span>
                  <span>{ticket.user.email}</span>
                  <span>•</span>
                  <span>Ticket #{ticket.id}</span>
                  <span>•</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Statut</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                  >
                    <option value="new">Nouveau</option>
                    <option value="open">Ouvert</option>
                    <option value="pending">En attente</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Priorité</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="high">Élevé</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">Description initiale:</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                {ticket.description}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {ticket.messages && ticket.messages.length > 1 && ticket.messages.slice(1).map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-xl shadow-sm p-4 md:p-6 ${
                message.is_internal 
                  ? 'border-l-4 border-amber-500 bg-amber-50/50' 
                  : message.user.is_admin 
                    ? 'border-l-4 border-sky-500' 
                    : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    message.is_internal 
                      ? 'bg-amber-600' 
                      : message.user.is_admin 
                        ? 'bg-sky-600' 
                        : 'bg-slate-400'
                  }`}>
                    {message.user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{message.user.name}</span>
                    {message.is_internal && (
                      <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                        Note interne
                      </span>
                    )}
                    {message.user.is_admin && !message.is_internal && (
                      <span className="px-2 py-0.5 text-xs bg-sky-100 text-sky-700 rounded-full">
                        Support
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(message.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Répondre</h3>
          <form onSubmit={handleSendMessage}>
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                />
                <span className="font-medium">Note interne</span>
                <span className="text-slate-500">(non visible par l'utilisateur)</span>
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isInternal ? "Ajoutez une note interne pour l'équipe..." : "Répondez à l'utilisateur..."}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                  isInternal 
                    ? 'border-amber-300 focus:ring-amber-500 bg-amber-50/30' 
                    : 'border-slate-300 focus:ring-sky-500'
                }`}
                rows={5}
                disabled={sending}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className={`px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                  isInternal
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                {sending ? 'Envoi...' : isInternal ? 'Ajouter la note' : 'Envoyer la réponse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
