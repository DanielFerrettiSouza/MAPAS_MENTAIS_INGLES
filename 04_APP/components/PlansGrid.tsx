import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function PlansGrid({ ctaHref = "/criar-conta", currentPlan }: { ctaHref?: string; currentPlan?: string }) {
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
            <Link href={`${ctaHref}${ctaHref.includes("?") ? "&" : "?"}plano=${p.id}`} className={`primary-btn ${p.highlight ? "grad-btn" : ""}`}>
              Assinar {p.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
