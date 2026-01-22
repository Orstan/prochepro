import React, { useState } from 'react';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    comment: string | null;
    photos?: string[] | null;
    created_at: string;
    client?: {
      id: number;
      name: string;
      avatar?: string | null;
    };
    prestataire?: {
      id: number;
      name: string;
      avatar?: string | null;
    };
    direction: 'client_to_prestataire' | 'prestataire_to_client';
  };
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, className = '' }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  
  // Determine the user who left the review
  const reviewer = review.direction === 'client_to_prestataire' ? review.client : review.prestataire;
  
  // Format date
  const formattedDate = new Date(review.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const handleOpenPhotoModal = (index: number) => {
    setActivePhotoIndex(index);
  };
  
  const handleClosePhotoModal = () => {
    setActivePhotoIndex(null);
  };
  
  const handleNextPhoto = () => {
    if (activePhotoIndex === null || !review.photos) return;
    setActivePhotoIndex((activePhotoIndex + 1) % review.photos.length);
  };
  
  const handlePrevPhoto = () => {
    if (activePhotoIndex === null || !review.photos) return;
    setActivePhotoIndex((activePhotoIndex - 1 + review.photos.length) % review.photos.length);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
          {reviewer?.avatar ? (
            <Image
              src={`${API_BASE_URL}${reviewer.avatar}`}
              alt={reviewer.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-sky-100 text-sky-600 font-semibold">
              {reviewer?.name.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        
        {/* Review content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900 truncate">
              {reviewer?.name || 'Utilisateur'}
            </span>
            <span className="text-xs text-slate-500">
              {formattedDate}
            </span>
          </div>
          
          {/* Rating stars */}
          <div className="flex items-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating ? 'text-amber-400' : 'text-slate-200'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-xs font-medium text-slate-700">
              {review.rating}/5
            </span>
          </div>
          
          {/* Comment */}
          {review.comment && (
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
              {review.comment}
            </p>
          )}
          
          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {review.photos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOpenPhotoModal(index)}
                  className="relative h-16 w-16 rounded-md overflow-hidden border border-slate-200 hover:border-sky-500 transition-colors"
                >
                  <Image
                    src={`${API_BASE_URL}${photo}`}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Photo Modal */}
      {activePhotoIndex !== null && review.photos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={handleClosePhotoModal}>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-full w-full">
              <Image
                src={`${API_BASE_URL}${review.photos[activePhotoIndex]}`}
                alt={`Photo ${activePhotoIndex + 1}`}
                width={800}
                height={600}
                className="object-contain max-h-[80vh]"
              />
            </div>
            
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={handleClosePhotoModal}
                className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {review.photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-xs text-white">
                  {activePhotoIndex + 1} / {review.photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
