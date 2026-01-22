# 📹 Cloudinary Setup Instructions

## 1. Install next-cloudinary

```bash
cd frontend
npm install next-cloudinary
```

## 2. Add to .env.local

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dbcrrwox1
NEXT_PUBLIC_CLOUDINARY_API_KEY=841235239618376
CLOUDINARY_API_SECRET=9l5XDgs4Z-eJMJtmPPCp3mJ2vZM
```

## 3. Cloudinary Configuration

- **Cloud Name:** dbcrrwox1
- **API Key:** 841235239618376
- **API Secret:** 9l5XDgs4Z-eJMJtmPPCp3mJ2vZM
- **Environment Variable:** `CLOUDINARY_URL=cloudinary://841235239618376:9l5XDgs4Z-eJMJtmPPCp3mJ2vZM@dbcrrwox1`

## 4. Video Upload Settings (Cloudinary Dashboard)

### Recommended Settings:
- **Max Duration:** 60 seconds
- **Max File Size:** 50MB
- **Allowed Formats:** mp4, webm, mov
- **Auto Transcoding:** Enabled
- **Adaptive Bitrate Streaming:** Enabled

### Video Transformations:
```
- Width: max 1080px
- Quality: auto
- Format: auto (mp4/webm based on browser)
- Compression: auto
```

## 5. Upload Preset (Create in Cloudinary)

Go to Settings → Upload → Add upload preset:

- **Preset Name:** `video_testimonials`
- **Signing Mode:** Unsigned
- **Folder:** `testimonials`
- **Tags:** `prochepro, testimonial`
- **Resource Type:** Video
- **Max Video Duration:** 60 seconds
- **Allowed Formats:** mp4, webm, mov
- **Transformations:**
  - Width: 1080
  - Quality: auto
  - Format: auto
  - Crop: limit

## 6. Usage in Components

```tsx
import { CldVideoPlayer } from 'next-cloudinary';

<CldVideoPlayer
  src="testimonials/video_id"
  width="500"
  height="888"
  muted
  autoplay
  loop
  controls
/>
```

## 7. Backend Migration

Run on server:

```bash
php artisan migrate
```

This will create the `video_testimonials` table.

## 8. API Endpoints

### Public:
- GET `/api/testimonials` - Get all active testimonials
- GET `/api/testimonials?limit=3` - Get limited testimonials
- GET `/api/testimonials/{id}` - Get single testimonial

### Admin:
- GET `/api/admin/video-testimonials` - Get all testimonials
- POST `/api/admin/video-testimonials` - Create testimonial
- PUT `/api/admin/video-testimonials/{id}` - Update testimonial
- DELETE `/api/admin/video-testimonials/{id}` - Delete testimonial
- POST `/api/admin/video-testimonials/{id}/toggle` - Toggle active status

## 9. Video Format Recommendations

- **Resolution:** 1080x1920 (vertical, 9:16)
- **Duration:** 15-60 seconds
- **Format:** MP4 (H.264)
- **Bitrate:** 2-5 Mbps
- **Audio:** AAC, 128 kbps

## 10. SEO & Performance

- Cloudinary automatically optimizes video delivery
- Lazy loading enabled by default
- Thumbnail generation automatic
- Multiple format fallbacks (mp4, webm)
