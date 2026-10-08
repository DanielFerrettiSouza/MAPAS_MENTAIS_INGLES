import Link from "next/link";
import { PLANS, checkoutUrl } from "@/lib/plans";

// Fora do app (landing), assinar leva para criar a conta primeiro.
// Dentro do app (com e-mail), leva direto para o checkout da Kiwify.
export default function PlansGrid({
  ctaHref = "/criar-conta",
  currentPlan,
  email,
}: {
  ctaHref?: string;
  currentPlan?: string;
  email?: string | null;
}) {
  return (
    <div className="plans">
      {PLANS.map((p) => (
        <div key={p.id} className={`plan ${p.highlight ? "highlight" : ""}`}>
          {p.highlight && <span className="badge-pop">Mais popular</span>}
          <h3>{p.name}</h3>
          <p className="tagline">{p.tagline}</p>
          <div className="price">
            {p.price}
            {p.id !== "free" && <small> /mês</small>}
          </div>
          {p.oldPrice && <div className="old">{p.oldPrice}/mês</div>}
          <ul>
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {currentPlan === p.id ? (
            <span className="ghost-btn">Seu plano atual</span>
          ) : p.id === "free" ? (
            <Link href={ctaHref} className="ghost-btn">Começar grátis</Link>
          ) : (
            <a
              href={
                (email && checkoutUrl(p.id, email)) ||
                (ctaHref === "/criar-conta"
                  ? `/criar-conta?next=${encodeURIComponent(`/app/planos?plano=${p.id}`)}`
                  : `${ctaHref}${ctaHref.includes("?") ? "&" : "?"}plano=${p.id}`)
              }
              className={`primary-btn ${p.highlight ? "grad-btn" : ""}`}
            >
              Assinar {p.name}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
