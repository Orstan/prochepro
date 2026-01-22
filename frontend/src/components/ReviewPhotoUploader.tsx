import React, { useState } from 'react';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';

interface ReviewPhotoUploaderProps {
  onPhotosChange: (photos: string[]) => void;
  initialPhotos?: string[];
  maxPhotos?: number;
  className?: string;
}

const ReviewPhotoUploader: React.FC<ReviewPhotoUploaderProps> = ({
  onPhotosChange,
  initialPhotos = [],
  maxPhotos = 5,
  className = '',
}) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding new photos would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      setError(`Vous pouvez télécharger jusqu'à ${maxPhotos} photos maximum`);
      return;
    }

    setUploading(true);
    setError(null);

    const token = localStorage.getItem('prochepro_token');
    if (!token) {
      setError('Vous devez être connecté pour télécharger des photos');
      setUploading(false);
      return;
    }

    try {
      const uploadedPhotos: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/api/reviews/upload-photo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erreur lors du téléchargement de l'image ${i + 1}`);
        }

        const data = await response.json();
        uploadedPhotos.push(data.path);
      }

      const updatedPhotos = [...photos, ...uploadedPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
    } catch (err) {
      setError('Erreur lors du téléchargement des photos');
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Photos (optionnel)
        </label>
        <span className="text-xs text-slate-500">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="relative h-20 w-20 rounded-md overflow-hidden border border-slate-200"
          >
            <Image
              src={`${API_BASE_URL}${photo}`}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemovePhoto(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label 
            className={`h-20 w-20 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <div className="h-5 w-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-1 text-xs text-slate-500">Ajouter</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading || photos.length >= maxPhotos}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Formats acceptés: JPG, PNG. Taille max: 5 MB par photo.
      </p>
    </div>
  );
};

export default ReviewPhotoUploader;
