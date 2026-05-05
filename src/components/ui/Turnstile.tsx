'use client';

import { useEffect, useRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  siteKey: string;
}

declare global {
  interface Window {
    onloadTurnstileCallback: () => void;
    turnstile: any;
  }
}

export default function Turnstile({ onVerify, siteKey }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    window.onloadTurnstileCallback = () => {
      if (containerRef.current && window.turnstile) {
        window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
        });
      }
    };

    script.onload = window.onloadTurnstileCallback;

    return () => {
      document.body.removeChild(script);
      delete (window as any).onloadTurnstileCallback;
    };
  }, [onVerify, siteKey]);

  return <div ref={containerRef} className="my-4" />;
}
