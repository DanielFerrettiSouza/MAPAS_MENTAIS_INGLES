"use client";

import { useEffect, useState } from "react";

// Tela que aparece quando algo trava no navegador (no lugar do "A client side error occurred").
// Registra o erro no servidor e, se a pessoa estiver no navegador do Instagram/Facebook,
// ensina a abrir no Safari ou no Chrome, onde o app funciona melhor.
export default function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset?: () => void }) {
  const [inApp, setInApp] = useState<"" | "ios" | "android">("");

  useEffect(() => {
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error?.message, digest: error?.digest, stack: error?.stack, url: location.href }),
      keepalive: true,
    }).catch(() => {});
    const ua = navigator.userAgent;
    if (/Instagram|FBAN|FBAV|FB_IAB/i.test(ua)) setInApp(/Android/i.test(ua) ? "android" : "ios");
  }, [error]);

  const chromeLink = () => {
    const url = location.href.replace(/^https?:\/\//, "");
    return `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  const box: React.CSSProperties = { maxWidth: 420, margin: "12vh auto", padding: 24, fontFamily: "system-ui, sans-serif", textAlign: "center", color: "#111" };
  const btn: React.CSSProperties = { display: "block", width: "100%", padding: "14px 16px", borderRadius: 12, border: 0, background: "#ef4444", color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 12, textDecoration: "none" };

  return (
    <div style={box}>
      <div style={{ fontSize: 44 }}>😕</div>
      <h1 style={{ fontSize: 22, margin: "8px 0" }}>Ops, a página não carregou direito</h1>
      {inApp ? (
        <>
          <p>Você está abrindo pelo navegador do Instagram/Facebook, que às vezes trava o app. Abra no navegador do celular:</p>
          {inApp === "android" ? (
            <a href={chromeLink()} style={btn}>Abrir no Chrome</a>
          ) : (
            <p style={{ background: "#f4f4f5", borderRadius: 12, padding: 12 }}>
              Toque em <b>⋯</b> (canto da tela) e escolha <b>Abrir no navegador</b> ou <b>Abrir no Safari</b>.
            </p>
          )}
        </>
      ) : (
        <p>Tente de novo. Se continuar, fale com a gente que resolvemos rapidinho.</p>
      )}
      <button style={btn} onClick={() => (reset ? reset() : location.reload())}>Tentar de novo</button>
      <a href="mailto:ola@mapasfalantes.com.br" style={{ display: "block", marginTop: 16, color: "#555" }}>
        Falar com o suporte: ola@mapasfalantes.com.br
      </a>
    </div>
  );
}
