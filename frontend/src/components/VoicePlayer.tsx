"use client";

import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

interface VoicePlayerProps {
  voiceUrl: string;
  duration: number;
}

export default function VoicePlayer({ voiceUrl, duration }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Build full URL if voiceUrl is relative
  const fullVoiceUrl = voiceUrl.startsWith('http') 
    ? voiceUrl 
    : `${API_BASE_URL}${voiceUrl}`;
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = (e: Event) => {
      setError('Erreur de chargement audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [fullVoiceUrl]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || error) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Impossible de lire l\'audio');
      setIsPlaying(false);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2 min-w-[200px]">
        <span className="text-xs text-red-600">❌ {error}</span>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            if (audioRef.current) {
              audioRef.current.load();
            }
          }}
          className="text-xs text-red-600 hover:text-red-700 underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2 min-w-[200px]">
      <audio ref={audioRef} src={fullVoiceUrl} preload="metadata" />
      
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
        ) :
        isPlaying ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-sky-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">
            🎤 {formatTime(currentTime)}
          </span>
          <span className="text-xs text-slate-400">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
