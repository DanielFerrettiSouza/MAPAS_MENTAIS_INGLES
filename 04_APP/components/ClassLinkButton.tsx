"use client";
import { useState } from "react";
import { createClassLink } from "@/app/app/turma-actions";

// Botão do plano Professor: gera o link da turma e copia.
export default function ClassLinkButton({ tipo, id, label = "Link para a turma" }: { tipo: "meu" | "biblioteca" | "audiobook"; id: string; label?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  async function go() {
    setState("busy");
    setError("");
    const r = await createClassLink(tipo, id);
    if (!r.path) { setError(r.error ?? "Erro"); setState("idle"); return; }
    const url = `${location.origin}${r.path}`;
    setLink(url);
    await navigator.clipboard?.writeText(url).catch(() => {});
    setState("done");
  }

  return (
    <span className="class-link">
      <button className="ghost-btn print-link" onClick={go} disabled={state === "busy"}>
        {state === "busy" ? "Preparando o link…" : state === "done" ? "✅ Link copiado!" : `🔗 ${label}`}
      </button>
      {link && <input className="field class-link-url" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />}
      {error && <small style={{ color: "var(--accent)" }}>{error}</small>}
    </span>
  );
}
