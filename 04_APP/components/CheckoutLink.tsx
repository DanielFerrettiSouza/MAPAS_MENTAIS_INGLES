"use client";

import type { CSSProperties, ReactNode } from "react";

// Botão de compra da página em espanhol: dispara InitiateCheckout no pixel do navegador e
// passa o mesmo event_id ao checkout, que repete o evento pelo servidor (a Meta conta uma vez só).
export default function CheckoutLink({ href, className, style, children }: { href: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={(e) => {
        const eid = `ic-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const fbq = (globalThis as { fbq?: (...a: unknown[]) => void }).fbq;
        fbq?.("track", "InitiateCheckout", { value: 27, currency: "USD", content_name: "Método Mapas Parlantes" }, { eventID: eid });
        e.preventDefault();
        const url = `${href}${href.includes("?") ? "&" : "?"}eid=${eid}`;
        setTimeout(() => (window.location.href = url), 150);
      }}
    >
      {children}
    </a>
  );
}
