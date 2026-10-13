"use client";
import { useState } from "react";

export default function TestimonialForm() {
  const [stars, setStars] = useState(5);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const data = new FormData(e.currentTarget);
    data.set("stars", String(stars));
    const res = await fetch("/api/depoimento", { method: "POST", body: data });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Erro ao enviar.");
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done") return <div className="lt-card" style={{ marginTop: 20 }}><h2>Obrigado! 💛</h2><p className="app-sub">Recebemos o seu depoimento.</p></div>;

  return (
    <form className="lt-card tf" onSubmit={submit} style={{ marginTop: 20 }}>
      <label>Sua nota
        <span className="tf-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setStars(n)} aria-label={`${n} estrelas`}>{n <= stars ? "★" : "☆"}</button>
          ))}
        </span>
      </label>
      <label>Seu depoimento<textarea name="text" required minLength={10} rows={5} placeholder="O que você mais gostou? Como você usa os mapas no dia a dia?" /></label>
      <label>Seu nome (como quer que apareça)<input name="name" required placeholder="Ex.: Mariana S." /></label>
      <label>Cidade (opcional)<input name="city" placeholder="Ex.: Curitiba" /></label>
      <label>Seu e-mail (não será publicado)<input name="email" type="email" required /></label>
      <label>Uma foto sua (opcional)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
      <label className="tf-check"><input type="checkbox" name="consent" required /> Autorizo o Mapas Falantes a publicar meu depoimento, nome, cidade e foto (se enviada) no site e em anúncios.</label>
      {error && <p style={{ color: "var(--accent)" }}>{error}</p>}
      <button className="primary-btn grad-btn" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : "Enviar depoimento"}</button>
    </form>
  );
}
