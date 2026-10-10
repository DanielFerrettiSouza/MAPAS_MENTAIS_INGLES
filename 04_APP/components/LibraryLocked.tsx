import Link from "next/link";
import { EXTRAS, checkoutUrl } from "@/lib/plans";

export default function LibraryLocked({ what, email, sample = false }: { what: string; email?: string | null; sample?: boolean }) {
  const buy = checkoutUrl("biblioteca", email);
  return (
    <div className="gen-box" style={{ textAlign: "center", marginTop: 20 }}>
      <h3 style={{ marginTop: 0 }}>🔒 {what} está nos planos Fluente e Professor</h3>
      <p style={{ color: "var(--muted)" }}>
        120 mapas prontos do A1 ao C2 e um plano de estudos montado pelo seu objetivo — sem gastar créditos.
        {sample && " Experimente grátis os 3 primeiros mapas abaixo."}
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/app/planos" className="primary-btn grad-btn">Ver planos</Link>
        {buy && (
          <a href={buy} className="ghost-btn">Só a biblioteca: {EXTRAS.biblioteca.price}, para sempre</a>
        )}
      </div>
    </div>
  );
}
