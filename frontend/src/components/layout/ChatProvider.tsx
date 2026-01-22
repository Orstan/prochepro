'use client';

import { useEffect, useState } from 'react';
import LiveChatWidget from '@/components/chat/LiveChatWidget';

export default function ChatProvider() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('prochepro_token');
    setIsLoggedIn(!!token);
    
    // Listen for login events
    const handleLogin = () => {
      const newToken = localStorage.getItem('prochepro_token');
      setIsLoggedIn(!!newToken);
    };
    
    window.addEventListener('prochepro_login', handleLogin);
    return () => window.removeEventListener('prochepro_login', handleLogin);
  }, []);

  // Show widget for everyone, but guests can only use FAQ
  return <LiveChatWidget isLoggedIn={isLoggedIn} />;
}
