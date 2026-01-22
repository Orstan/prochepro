"use client";

import { useState } from "react";

interface VideoCallButtonProps {
  taskId: string;
  otherUserName: string;
  onCallStart: () => void;
}

export default function VideoCallButton({ taskId, otherUserName, onCallStart }: VideoCallButtonProps) {
  const [showModal, setShowModal] = useState(false);

  function handleStartCall() {
    setShowModal(false);
    onCallStart();
    // Open video call in new window or modal
    const callUrl = `/video-call/${taskId}`;
    window.open(callUrl, '_blank', 'width=1200,height=800');
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        title="Démarrer un appel vidéo"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span className="hidden sm:inline">Appel vidéo</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Appel vidéo
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Voulez-vous démarrer un appel vidéo avec {otherUserName} ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleStartCall}
                className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Démarrer
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              💡 L'appel s'ouvrira dans une nouvelle fenêtre
            </p>
          </div>
        </div>
      )}
    </>
  );
}
