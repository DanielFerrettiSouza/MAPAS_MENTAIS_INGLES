import Link from "next/link";

export default function LibraryLocked({ what }: { what: string }) {
  return (
    <div className="gen-box" style={{ textAlign: "center", marginTop: 20 }}>
      <h3 style={{ marginTop: 0 }}>🔒 {what} é exclusivo dos planos Fluente e Professor</h3>
      <p style={{ color: "var(--muted)" }}>
        Biblioteca com 120 mapas prontos do A1 ao C2 e um plano de estudos montado pelo seu objetivo — sem gastar créditos.
      </p>
      <Link href="/app/planos" className="primary-btn grad-btn">Ver planos</Link>
    </div>
  );
}
