"use client";

import { checkoutUrl, EXTRAS, PLANS } from "@/lib/plans";
import { track } from "@/lib/pixel";

// Compra direta (página do método): vai ao checkout da Kiwify sem criar conta antes.
// O webhook guarda a compra pelo e-mail e aplica quando a pessoa cria a conta.
export default function BuyButton({ plan = "biblioteca", label, className = "primary-btn grad-btn", style }: { plan?: string; label: string; className?: string; style?: React.CSSProperties }) {
  const p = PLANS.find((x) => x.id === plan) ?? (plan === "biblioteca" ? EXTRAS.biblioteca : EXTRAS.pacote);
  return (
    <a
      href={checkoutUrl(plan) ?? "/quiz"}
      className={className}
      style={style}
      onClick={(e) => {
        track("InitiateCheckout", { content_name: p.name, value: Number(p.price.replace(/[^\d,]/g, "").replace(",", ".")), currency: "BRL" });
        // Dá tempo do pixel do navegador enviar o evento antes de trocar de página
        // (sem isso, só o envio pelo servidor chegava).
        const href = e.currentTarget.href;
        if (href.startsWith("http") && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          setTimeout(() => (location.href = href), 400);
        }
      }}
    >
      {label}
    </a>
  );
}
