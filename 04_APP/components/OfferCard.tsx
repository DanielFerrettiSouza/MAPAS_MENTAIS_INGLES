"use client";

import Link from "next/link";
import { PLANS, checkoutUrl } from "@/lib/plans";
import { track } from "@/lib/pixel";

// Oferta no painel do aluno grátis: plano recomendado (Fluente) com checkout direto.
export default function OfferCard({ email, credits }: { email?: string | null; credits: number }) {
  const plan = PLANS.find((p) => p.id === "fluente")!;
  const href = checkoutUrl(plan.id, email) ?? "/app/planos";
  return (
    <div className="offer-card">
      <div className="offer-main">
        <p className="offer-kicker">⭐ Recomendado para você · Plano {plan.name}</p>
        <h2 className="offer-title">
          Destrave seu inglês com <span className="grad-text">{plan.credits} mapas por mês</span>
        </h2>
        <ul className="offer-list">
          {plan.features.slice(1, 4).map((f) => (
            <li key={f}>✓ {f}</li>
          ))}
        </ul>
        <p className="offer-note">
          {credits > 0
            ? `Você ainda tem ${credits} ${credits === 1 ? "mapa grátis" : "mapas grátis"} — assine quando quiser continuar.`
            : "Seus mapas grátis acabaram — continue de onde parou."}
        </p>
      </div>
      <div className="offer-side">
        {plan.oldPrice && <span className="offer-old">{plan.oldPrice}</span>}
        <span className="offer-price">
          {plan.price}
          <small>/mês</small>
        </span>
        <a
          href={href}
          className="primary-btn grad-btn"
          onClick={() =>
            track("InitiateCheckout", {
              content_name: plan.name,
              value: Number(plan.price.replace(/[^\d,]/g, "").replace(",", ".")),
              currency: "BRL",
            })
          }
        >
          Assinar o {plan.name}
        </a>
        <span className="offer-guarantee">🛡️ 7 dias de garantia · cancele quando quiser</span>
        <Link href="/app/planos" className="offer-more">Ver todos os planos →</Link>
      </div>
    </div>
  );
}
