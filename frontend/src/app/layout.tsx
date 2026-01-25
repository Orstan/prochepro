import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "./SiteShell";
import { ToastProvider } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import ChatProvider from "@/components/layout/ChatProvider";
import InAppNotifications from "@/components/notifications/InAppNotifications";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateLocalBusinessSchema,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://prochepro.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Services entre particuliers à Paris : Trouvez un prestataire de confiance | ProchePro",
    template: "%s | ProchePro",
  },
  description:
    "ProchePro : la plateforme de services entre particuliers à Paris. Trouvez un prestataire vérifié pour vos annonces : ménage, bricolage, déménagement, jardinage. Paiement sécurisé, profils vérifiés.",
  keywords: [
    "services entre particuliers Paris",
    "annonces services Paris",
    "prestataire de confiance Paris",
    "aide à domicile Paris",
    "services à domicile Paris",
    "ménage Paris",
    "bricolage Paris",
    "déménagement Paris",
    "jardinage Paris",
    "plombier Paris",
    "électricien Paris",
    "75001",
    "75015",
    "Île-de-France",
  ],
  authors: [{ name: "ProchePro", url: SITE_URL }],
  creator: "ProchePro",
  publisher: "ProchePro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fr-FR": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    title: "Services entre particuliers à Paris | ProchePro",
    description:
      "Trouvez un prestataire de confiance à Paris pour vos annonces de services. Paiement sécurisé, profils vérifiés avec pièce d'identité.",
    siteName: "ProchePro",
    images: [
      {
        url: `${SITE_URL}/og-image.png?v=2026`,
        width: 1200,
        height: 630,
        alt: "ProchePro - Services à domicile en France",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services entre particuliers à Paris | ProchePro",
    description:
      "Trouvez un prestataire de confiance à Paris. Paiement sécurisé Stripe, profils vérifiés.",
    images: [`${SITE_URL}/og-image.png?v=2026`],
    creator: "@prochepro",
  },
  manifest: "/site.webmanifest",
  themeColor: "#1E88E5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProchePro",
  },
  icons: {
    icon: [
      // { url: "/favicon.svg", type: "image/svg+xml" }, // Видалено через 404 помилку
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "alternate icon",
        url: "/favicon.ico",
      },
    ]
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  verification: {
    google: "prochepro-google-site-verification-2025",
    other: {
      "msvalidate.01": "prochepro-bing-verification-2025",
      "yandex-verification": "prochepro-yandex-verification-2025",
    },
  },
  category: "services",
  other: {
    "facebook-domain-verification": "prochepro-facebook-verification-2025",
    // Telegram
    "telegram:image": `${SITE_URL}/og-image.png?v=2026`,
    // VK (VKontakte)
    "vk:image": `${SITE_URL}/og-image.png?v=2026`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Open Graph для всіх месенджерів (WhatsApp, Viber, Telegram, Facebook) */}
        <meta property="og:image" content={`${SITE_URL}/og-image.png?v=2026`} />
        <meta property="og:image:secure_url" content={`${SITE_URL}/og-image.png?v=2026`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ProchePro - Services à domicile en France" />

        {/* Twitter Card */}
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png?v=2026`} />
        <meta name="twitter:image:alt" content="ProchePro - Services à domicile en France" />

        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-7434166826056099" />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7434166826056099"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script id="adsense-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              if (typeof window.adsbygoogle !== 'undefined') {
                // AdSense initialized
              }
            };
          `
        }} />
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="2acc308b-67fe-444d-b4e2-7738547eb95d"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17836471073"
          strategy="afterInteractive"
        />
        <Script
          id="google-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17836471073');
            `,
          }}
        />
        {/* Google tag (gtag.js) - AW-17868549005 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17868549005"
          strategy="afterInteractive"
        />
        <Script
          id="google-tag-aw-17868549005"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17868549005');
            `,
          }}
        />
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2001443470711775');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2001443470711775&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* Microsoft Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "v119t6ehu6");
            `,
          }}
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
        {/* Service Worker & Push Notifications */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async function() {
                  try {
                    // Register Service Worker
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    
                    // Wait for Service Worker to become active
                    if (registration.installing) {
                      await new Promise(resolve => {
                        registration.installing.addEventListener('statechange', function() {
                          if (this.state === 'activated') resolve();
                        });
                      });
                    } else if (!registration.active) {
                      await navigator.serviceWorker.ready;
                    }
                    
                    // Global function to register push notifications
                    window.registerPushNotifications = async function() {
                      try {
                        const apiUrl = 'https://api.prochepro.fr';
                        console.log('[Push] Starting registration...');
                        console.log('[Push] API URL:', apiUrl);
                        
                        // Check if user is logged in
                        const userStr = localStorage.getItem('prochepro_user');
                        if (!userStr) {
                          console.log('[Push] User not logged in');
                          return;
                        }
                        
                        const userData = JSON.parse(userStr);
                        if (!userData?.id) {
                          console.log('[Push] Invalid user data');
                          return;
                        }
                        console.log('[Push] User ID:', userData.id);
                        
                        // Request permission if needed
                        let permission = Notification.permission;
                        console.log('[Push] Current permission:', permission);
                        
                        if (permission === 'default') {
                          permission = await Notification.requestPermission();
                          console.log('[Push] Permission after request:', permission);
                        }
                        
                        if (permission !== 'granted') {
                          console.log('[Push] Permission not granted');
                          return;
                        }
                        
                        // Get VAPID key
                        console.log('[Push] Fetching VAPID key...');
                        const vapidRes = await fetch(apiUrl + '/api/push/vapid-key');
                        if (!vapidRes.ok) {
                          console.error('[Push] VAPID fetch failed:', vapidRes.status);
                          return;
                        }
                        const vapidData = await vapidRes.json();
                        console.log('[Push] VAPID key received:', vapidData.publicKey?.substring(0, 20) + '...');
                        
                        // Check for existing subscription and unsubscribe if different VAPID key
                        try {
                          const existingSubscription = await registration.pushManager.getSubscription();
                          if (existingSubscription) {
                            console.log('[Push] Found existing subscription, unsubscribing...');
                            await existingSubscription.unsubscribe();
                            console.log('[Push] Old subscription removed');
                          }
                        } catch (unsubErr) {
                          console.log('[Push] No existing subscription or unsubscribe failed:', unsubErr);
                        }
                        
                        // Subscribe to push
                        console.log('[Push] Subscribing to push manager...');
                        const subscription = await registration.pushManager.subscribe({
                          userVisibleOnly: true,
                          applicationServerKey: vapidData.publicKey
                        });
                        console.log('[Push] Subscription created:', subscription.endpoint.substring(0, 50) + '...');
                        
                        // Send to backend
                        console.log('[Push] Sending subscription to backend...');
                        const response = await fetch(apiUrl + '/api/push/subscribe', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                          },
                          body: JSON.stringify({
                            user_id: userData.id,
                            subscription: subscription.toJSON()
                          })
                        });
                        
                        if (!response.ok) {
                          const errorText = await response.text();
                          console.error('[Push] Backend error:', response.status, errorText);
                          return;
                        }
                        
                        const result = await response.json();
                        console.log('[Push] ✅ Registration complete!', result);
                      } catch (err) {
                        console.error('[Push] Registration failed:', err);
                      }
                    };
                    
                    // Try to register on load if user is already logged in
                    setTimeout(() => {
                      if (localStorage.getItem('prochepro_user')) {
                        window.registerPushNotifications();
                      }
                    }, 2000);
                  } catch (err) {
                    // ServiceWorker registration failed
                  }
                  
                  // Listen for push notifications from Service Worker
                  navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'push-notification') {
                      
                      // Dispatch custom event for InAppNotifications component
                      window.dispatchEvent(new CustomEvent('push-notification-received', {
                        detail: event.data.data
                      }));
                      
                      // Play notification sound if available
                      try {
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => {});
                      } catch (e) {
                        // Sound not available
                      }
                    }
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <SiteShell>{children}</SiteShell>
            <ChatProvider />
            <InAppNotifications />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
