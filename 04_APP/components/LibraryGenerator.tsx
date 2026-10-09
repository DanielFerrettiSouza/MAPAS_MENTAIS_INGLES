"use client";

import { useRef, useState } from "react";

// Botão do admin: gera a biblioteca tema por tema até acabar (pode fechar e continuar depois).
export default function LibraryGenerator({ ready, total }: { ready: number; total: number }) {
  const [count, setCount] = useState(ready);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string>("");
  const stop = useRef(false);

  async function run() {
    setRunning(true);
    stop.current = false;
    while (!stop.current) {
      const res = await fetch("/api/admin/library", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setLog(`⚠️ ${data.error ?? "Erro"} — tente continuar de novo.`); break; }
      if (data.done) { setLog("✅ Biblioteca completa!"); setCount(data.ready); break; }
      setCount(data.ready);
      setLog(`Criado: ${data.created}`);
    }
    setRunning(false);
  }

  return (
    <div className="gen-box" style={{ marginTop: 12 }}>
      <strong>Biblioteca pronta: {count}/{total} mapas</strong>
      <p className="admin-note">Gera 1 mapa por vez (~30s cada, com capa ilustrada). Pode parar e continuar depois.</p>
      {running ? (
        <button className="secondary-btn" onClick={() => (stop.current = true)}>Parar depois deste</button>
      ) : (
        <button className="primary-btn grad-btn" onClick={run} disabled={count >= total}>
          {count >= total ? "Completa" : count ? "Continuar gerando" : "Gerar biblioteca"}
        </button>
      )}
      {log && <p className="admin-note">{log}</p>}
    </div>
  );
}
