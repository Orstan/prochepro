"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import UserAvatar from "@/components/UserAvatar";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active_role?: string;
  avatar?: string | null;
}

interface Task {
  id: number;
  title: string;
  status: string;
  client_id: number;
  client?: { id: number; name: string; avatar?: string | null };
}

interface Offer {
  id: number;
  task_id: number;
  prestataire_id: number;
  status: string;
  task?: Task;
  prestataire?: { id: number; name: string; avatar?: string | null };
}

interface Conversation {
  task: Task;
  otherUser: { id: number; name: string; avatar?: string | null };
  lastMessage?: string;
  unread?: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prochepro_user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      fetchConversations(parsed);
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  async function fetchConversations(currentUser: User) {
    setLoading(true);
    try {
      const convs: Conversation[] = [];
      const userRole = currentUser.active_role || currentUser.role;

      if (userRole === "client") {
        // Client: get all tasks with in_progress or completed status
        const res = await fetch(`${API_BASE_URL}/api/tasks?client_id=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          const allTasks = data?.data ?? data ?? [];
          // Filter only tasks that can have chat (in_progress or completed)
          const tasks = allTasks.filter((t: Task) => 
            t.status === "in_progress" || t.status === "completed"
          );
          
          for (const task of tasks) {
            // Get accepted offer for this task
            const offerRes = await fetch(`${API_BASE_URL}/api/offers?task_id=${task.id}&status=accepted`);
            if (offerRes.ok) {
              const offers = await offerRes.json();
              const acceptedOffer = (offers?.data ?? offers ?? [])[0];
              if (acceptedOffer) {
                let prestataireData = acceptedOffer.prestataire;
                
                // If prestataire data is missing, fetch it
                if (!prestataireData || !prestataireData.name) {
                  try {
                    const userRes = await fetch(`${API_BASE_URL}/api/users/${acceptedOffer.prestataire_id}`);
                    if (userRes.ok) {
                      const userData = await userRes.json();
                      prestataireData = { id: userData.id, name: userData.name, avatar: userData.avatar };
                    }
                  } catch {
                    prestataireData = { id: acceptedOffer.prestataire_id, name: "Prestataire", avatar: null };
                  }
                }
                
                if (prestataireData) {
                  convs.push({
                    task,
                    otherUser: prestataireData,
                  });
                }
              }
            }
          }
        }
      } else {
        // Prestataire: get accepted offers
        const res = await fetch(`${API_BASE_URL}/api/offers?prestataire_id=${currentUser.id}&status=accepted`);
        if (res.ok) {
          const data = await res.json();
          const offers = data?.data ?? data ?? [];
          
          for (const offer of offers) {
            // Only include tasks with in_progress or completed status
            if (offer.task && (offer.task.status === "in_progress" || offer.task.status === "completed")) {
              let otherUserData = offer.task.client;
              
              // If client data is missing, fetch it
              if (!otherUserData || !otherUserData.name) {
                try {
                  const userRes = await fetch(`${API_BASE_URL}/api/users/${offer.task.client_id}`);
                  if (userRes.ok) {
                    const userData = await userRes.json();
                    otherUserData = { id: userData.id, name: userData.name, avatar: userData.avatar };
                  }
                } catch {
                  otherUserData = { id: offer.task.client_id, name: "Client", avatar: null };
                }
              }
              
              convs.push({
                task: offer.task,
                otherUser: otherUserData || { id: offer.task.client_id, name: "Client", avatar: null },
              });
            }
          }
        }
      }

      setConversations(convs);
    } catch (err) {
      // Error fetching conversations
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;
  
  const userRole = user.active_role || user.role;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Messages</h1>
      <p className="text-sm text-slate-600 mb-6">
        Vos conversations avec les {userRole === "client" ? "prestataires" : "clients"} pour vos annonces en cours et passées.
      </p>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-slate-600">Chargement...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-semibold text-slate-900 mb-1">Aucune conversation</h3>
          <p className="text-sm text-slate-600">
            {userRole === "client" 
              ? "Vos conversations apparaîtront ici une fois qu'un prestataire aura accepté votre annonce."
              : "Vos conversations apparaîtront ici une fois que votre offre sera acceptée."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <button
              key={conv.task.id}
              onClick={() => router.push(`/messages/${conv.task.id}`)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all text-left"
            >
              <UserAvatar 
                avatar={conv.otherUser.avatar} 
                name={conv.otherUser.name} 
                size="md" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {conv.otherUser.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    conv.task.status === "in_progress" 
                      ? "bg-amber-100 text-amber-700" 
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {conv.task.status === "in_progress" ? "En cours" : "Terminée"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate mt-0.5">
                  {conv.task.title}
                </p>
              </div>
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
