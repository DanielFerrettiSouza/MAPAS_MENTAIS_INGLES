import type { ReactNode } from "react";
import SiteNav from "./SiteNav";

export default function LegalPage({ title, children, lang = "pt" }: { title: string; children: ReactNode; lang?: "pt" | "es" }) {
  return (
    <>
      {lang === "es" ? (
        <header className="site-nav"><div className="wrap" style={{ padding: "14px 0" }}><a href="/es/metodo"><strong>🔊 Mapas Parlantes</strong></a></div></header>
      ) : <SiteNav />}
      <main className="wrap legal">
        <h1 className="big-title">{title}</h1>
        <p style={{ color: "var(--muted)" }}>{lang === "es" ? "Última actualización: octubre de 2026" : "Última atualização: outubro de 2026"}</p>
        {children}
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} {lang === "es" ? "Mapas Parlantes" : "Mapas Falantes"}</footer>
    </>
  );
}
