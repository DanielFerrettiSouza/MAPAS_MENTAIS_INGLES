"use client";

import { checkoutUrl, PLANS } from "@/lib/plans";
import { track } from "@/lib/pixel";

// Compra direta (página do método): vai ao checkout da Kiwify sem criar conta antes.
// O webhook guarda o plano pelo e-mail e aplica quando a pessoa cria a conta.
export default function BuyButton({ plan = "fluente", label, className = "primary-btn grad-btn", style }: { plan?: string; label: string; className?: string; style?: React.CSSProperties }) {
  const p = PLANS.find((x) => x.id === plan)!;
  return (
    <a
      href={checkoutUrl(plan) ?? `/criar-conta?next=${encodeURIComponent(`/app/planos?plano=${plan}`)}`}
      className={className}
      style={style}
      onClick={() => track("InitiateCheckout", { content_name: p.name, value: Number(p.price.replace(/[^\d,]/g, "").replace(",", ".")), currency: "BRL" })}
    >
      {label}
    </a>
  );
}
