"use client";
import { useState } from "react";

export default function TestimonialForm({ email = "" }: { email?: string }) {
  const [stars, setStars] = useState(5);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [gift, setGift] = useState("");

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
    setGift(json.gift ?? "");
    setState("done");
  }

  if (state === "done") return <div className="lt-card" style={{ marginTop: 20 }}><h2>Obrigado! 💛</h2><p className="app-sub">Recebemos o seu depoimento.{gift === "ok" ? " Seus 5 mapas de presente já estão na sua conta." : gift === "ja" ? "" : " Não achamos uma conta com este e-mail. Responda o nosso e-mail com o endereço que você usa no app que liberamos seus 5 mapas."}</p></div>;

  return (
    <form className="lt-card tf" onSubmit={submit} style={{ marginTop: 20 }}>
      <div className="tf-gift">🎁 Mandou o depoimento, ganhou <strong>5 mapas com IA</strong> de presente.</div>
      <label>Sua nota
        <span className="tf-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setStars(n)} aria-label={`${n} estrelas`}>{n <= stars ? "★" : "☆"}</button>
          ))}
        </span>
      </label>
      <label>Seu depoimento<textarea name="text" required minLength={80} rows={5} placeholder="Conte em 2 ou 3 frases: como estava seu inglês antes, como você usa os mapas no dia a dia e o que mudou." /><small>Mínimo de 80 caracteres.</small></label>
      <label>Seu nome (como quer que apareça)<input name="name" required placeholder="Ex.: Mariana S." /></label>
      <label>Cidade <small>(opcional)</small><input name="city" placeholder="Ex.: Curitiba" /></label>
      <label>Seu e-mail <small>(o mesmo da compra; não será publicado)</small><input name="email" type="email" required defaultValue={email} /></label>
      <label>Uma foto sua <small>(obrigatória: pode ser uma selfie tirada agora com o celular)</small><input name="photo" type="file" accept="image/*" required /></label>
      <label className="tf-check"><input type="checkbox" name="consent" required /> Autorizo o Mapas Falantes a publicar meu depoimento, nome, cidade e foto no site e em anúncios, informando que recebi 5 mapas de presente por ele.</label>
      {error && <p style={{ color: "var(--accent)" }}>{error}</p>}
      <button className="primary-btn grad-btn" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : "Enviar depoimento"}</button>
    </form>
  );
}
