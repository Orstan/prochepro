"use client";

import { useState } from "react";

type VideoTestimonial = {
  id: number;
  cloudinary_public_id: string;
  name: string;
  role: string | null;
  text: string | null;
  duration: number | null;
  thumbnail_url: string | null;
};

type Props = {
  testimonial: VideoTestimonial;
  autoplay?: boolean;
  showText?: boolean;
};

export default function VideoTestimonialCard({ testimonial, autoplay = false, showText = true }: Props) {
  // Отримуємо пряме посилання на відео
  const getVideoUrl = (idOrUrl: string): string => {
    // Якщо вже URL - повертаємо як є
    if (idOrUrl.startsWith('http')) {
      return idOrUrl;
    }
    // Якщо public_id - формуємо URL
    return `https://res.cloudinary.com/dbcrrwox1/video/upload/${idOrUrl}`;
  };

  const getRoleBadge = () => {
    if (!testimonial.role) return null;
    
    const badges = {
      client: { text: "Client", bg: "bg-sky-100", color: "text-sky-700" },
      prestataire: { text: "Prestataire", bg: "bg-emerald-100", color: "text-emerald-700" },
    };
    
    const badge = badges[testimonial.role as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`inline-flex items-center rounded-full ${badge.bg} px-3 py-1 text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="group relative w-full">
      {/* Video Container */}
      <div className="relative aspect-[9/16] max-h-[400px] md:max-h-[500px] overflow-hidden rounded-2xl bg-slate-900 mx-auto" style={{ maxWidth: '280px' }}>
        <video
          className="h-full w-full object-cover rounded-2xl"
          controls
          loop
          muted={autoplay}
          autoPlay={autoplay}
          playsInline
          preload="metadata"
        >
          <source src={getVideoUrl(testimonial.cloudinary_public_id)} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
        
        {/* Duration Badge */}
        {testimonial.duration && (
          <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {testimonial.duration}s
          </div>
        )}
      </div>

      {/* Info Section */}
      {showText && (
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{testimonial.name}</h3>
            {getRoleBadge()}
          </div>
          
          {testimonial.text && (
            <p className="text-sm text-slate-600 line-clamp-3">{testimonial.text}</p>
          )}
        </div>
      )}
    </div>
  );
}
