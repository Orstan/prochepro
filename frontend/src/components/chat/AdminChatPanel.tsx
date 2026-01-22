'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, AlertCircle, CheckCircle2, ArrowLeft, XCircle, ChevronDown, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ChatRoom {
  id: number;
  user: { id: number; name: string; email: string };
  status: string;
  priority: string;
  category: string;
  unread_admin_count: number;
  last_message_at: string;
  assigned_to: number | null;
  assignedAdmin?: { name: string };
}

export default function AdminChatPanel() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    open: 0,
    assigned: 0,
    unassigned: 0,
    urgent: 0,
  });

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.prochepro.fr'}/api`;

  useEffect(() => {
    setIsLoading(true);
    fetchRooms();
    fetchStats();
  }, [filter]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('prochepro_token');
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        if (filter === 'unassigned') {
          params.append('unassigned', 'true');
        } else if (filter === 'unread') {
          params.append('unread', 'true');
        } else {
          params.append('status', filter);
        }
      }

      const response = await axios.get(`${API_URL}/admin/chat/rooms?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRooms(response.data.data || []);
    } catch (error) {
      // Failed to fetch rooms
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('prochepro_token');
      const response = await axios.get(`${API_URL}/admin/chat/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      // Failed to fetch stats
    }
  };

  const assignToMe = async (roomId: number) => {
    try {
      const token = localStorage.getItem('prochepro_token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await axios.post(
        `${API_URL}/admin/chat/rooms/${roomId}/assign`,
        { admin_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchRooms();
    } catch (error) {
      // Failed to assign
    }
  };

  const updateStatus = async (roomId: number, status: string) => {
    try {
      const token = localStorage.getItem('prochepro_token');
      await axios.post(
        `${API_URL}/admin/chat/rooms/${roomId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
    } catch (error) {
      // Failed to update status
    }
  };

  const updatePriority = async (roomId: number, priority: string) => {
    try {
      const token = localStorage.getItem('prochepro_token');
      await axios.post(
        `${API_URL}/admin/chat/rooms/${roomId}/priority`,
        { priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
    } catch (error) {
      // Failed to update priority
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-700 bg-red-100',
      high: 'text-orange-700 bg-orange-100',
      normal: 'text-blue-700 bg-blue-100',
      low: 'text-slate-700 bg-slate-100',
    };
    return colors[priority] || colors.normal;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'text-emerald-700 bg-emerald-100',
      assigned: 'text-sky-700 bg-sky-100',
      resolved: 'text-purple-700 bg-purple-100',
      closed: 'text-slate-700 bg-slate-100',
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button 
            onClick={() => router.push('/admin')} 
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Chat Support</h1>
          <p className="text-sm text-slate-600 mt-1">Gérer les conversations avec les utilisateurs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px] sm:text-xs">Ouvert</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.open}</p>
              </div>
              <MessageCircle className="text-emerald-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px] sm:text-xs">Assigné</p>
                <p className="text-xl sm:text-2xl font-bold text-sky-600">{stats.assigned}</p>
              </div>
              <User className="text-sky-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px] sm:text-xs">Non assigné</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.unassigned}</p>
              </div>
              <Clock className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px] sm:text-xs">Urgent</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {['all', 'open', 'assigned', 'unassigned', 'unread', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filter === f
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <MessageCircle size={48} className="mx-auto mb-4 text-slate-300" />
              <p>Aucune conversation trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {rooms.map((room) => (
                <div key={room.id} className="p-3 sm:p-4 hover:bg-slate-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">{room.user.name}</h3>
                        
                        {/* Status Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setEditingRoomId(editingRoomId === room.id ? null : room.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition ${getStatusColor(room.status)}`}
                          >
                            {room.status}
                            <ChevronDown size={12} />
                          </button>
                          {editingRoomId === room.id && (
                            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px] z-20">
                              {['open', 'assigned', 'resolved', 'closed'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => {
                                    updateStatus(room.id, status);
                                    setEditingRoomId(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition ${room.status === status ? 'font-bold' : ''}`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Priority Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setEditingRoomId(editingRoomId === -room.id ? null : -room.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition ${getPriorityColor(room.priority)}`}
                          >
                            {room.priority}
                            <ChevronDown size={12} />
                          </button>
                          {editingRoomId === -room.id && (
                            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px] z-20">
                              {['low', 'normal', 'high', 'urgent'].map((priority) => (
                                <button
                                  key={priority}
                                  onClick={() => {
                                    updatePriority(room.id, priority);
                                    setEditingRoomId(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition ${room.priority === priority ? 'font-bold' : ''}`}
                                >
                                  {priority}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {room.unread_admin_count > 0 && (
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {room.unread_admin_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">{room.user.email}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">
                        {room.category} • {new Date(room.last_message_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      {room.assignedAdmin && (
                        <p className="text-[10px] sm:text-xs text-sky-600 mt-1">
                          ✓ {room.assignedAdmin.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col gap-1.5 sm:gap-2 flex-shrink-0">
                      <a
                        href={`/admin/chat/${room.id}`}
                        className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition text-center text-xs sm:text-sm font-medium"
                      >
                        Ouvrir
                      </a>
                      {!room.assigned_to && (
                        <button
                          onClick={() => assignToMe(room.id)}
                          className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-xs sm:text-sm font-medium"
                        >
                          M'assigner
                        </button>
                      )}
                      {room.status !== 'resolved' && room.status !== 'closed' && (
                        <button
                          onClick={() => updateStatus(room.id, 'resolved')}
                          className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition text-xs sm:text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          Résoudre
                        </button>
                      )}
                      {room.status === 'resolved' && (
                        <button
                          onClick={() => updateStatus(room.id, 'closed')}
                          className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-xs sm:text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <XCircle size={14} />
                          Fermer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
