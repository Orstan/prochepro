"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally for Echo
if (typeof window !== "undefined") {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> | null {
  // WebSocket disabled - not configured properly
  // Causes 500 errors on backend and localhost connection attempts
  return null;
  
  // if (typeof window === "undefined") {
  //   return null;
  // }

  // if (!echoInstance) {
  //   echoInstance = new Echo({
  //     broadcaster: "reverb",
  //     key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "prochepro-key",
  //     wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
  //     wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
  //     wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
  //     forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || "http") === "https",
  //     enabledTransports: ["ws", "wss"],
  //   });
  // }

  // return echoInstance;
}