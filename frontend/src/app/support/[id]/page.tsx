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
  };
  messages: Message[];
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;
  
  const [user, setUser] = useState<any>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
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
      } else if (res.status === 403) {
        alert('Accès non autorisé');
        router.push('/support');
      }
    } catch (error) {
      // Error fetching ticket
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
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchTicket();
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      alert('Erreur de connexion au serveur');
    } finally {
      setSending(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      open: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-purple-100 text-purple-800',
      closed: 'bg-slate-100 text-slate-600',
    };
    const labels = {
      new: 'Nouveau',
      open: 'Ouvert',
      pending: 'En attente',
      resolved: 'Résolu',
      closed: 'Fermé',
    };
    return (
      <span className={`px-3 py-1 text-sm rounded-full font-medium ${styles[status as keyof typeof styles] || styles.closed}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  }

  function getPriorityBadge(priority: string) {
    const styles = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    const labels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
    };
    return (
      <span className={`px-3 py-1 text-sm rounded-full font-medium ${styles[priority as keyof typeof styles] || styles.medium}`}>
        {labels[priority as keyof typeof labels] || priority}
      </span>
    );
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
            onClick={() => router.push('/support')}
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/support')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors group"
          >
            <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour aux tickets</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                  {ticket.subject}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
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
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {ticket.messages && ticket.messages.length > 1 && ticket.messages.slice(1).map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-xl shadow-sm p-4 md:p-6 ${
                message.user.is_admin ? 'border-l-4 border-sky-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    message.user.is_admin ? 'bg-sky-600' : 'bg-slate-400'
                  }`}>
                    {message.user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{message.user.name}</span>
                    {message.user.is_admin && (
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
        {!['resolved', 'closed'].includes(ticket.status) && (
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Répondre</h3>
            <form onSubmit={handleSendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                rows={4}
                disabled={sending}
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {['resolved', 'closed'].includes(ticket.status) && (
          <div className="bg-slate-100 rounded-xl p-4 md:p-6 text-center">
            <p className="text-slate-600">
              Ce ticket est {ticket.status === 'resolved' ? 'résolu' : 'fermé'}. 
              Si vous avez besoin d'aide supplémentaire, créez un nouveau ticket.
            </p>
            <button
              onClick={() => router.push('/support')}
              className="mt-4 px-6 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
            >
              Créer un nouveau ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
