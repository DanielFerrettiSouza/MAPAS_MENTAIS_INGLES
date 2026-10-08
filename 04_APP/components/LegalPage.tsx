import type { ReactNode } from "react";
import SiteNav from "./SiteNav";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="wrap legal">
        <h1 className="big-title">{title}</h1>
        <p style={{ color: "var(--muted)" }}>Última atualização: outubro de 2026</p>
        {children}
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Mapas Falantes</footer>
    </>
  );
}
