"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "./Logo";
import { createSupabaseBrowser } from "@/lib/supa/client";

export default function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const callback = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createSupabaseBrowser();
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback() },
      });
      if (error) setError(traduz(error.message));
      else if (!data.session) setInfo("Quase lá! Enviamos um link para o seu e-mail. Clique nele para ativar a conta.");
      else router.push(next);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduz(error.message));
      else router.push(next);
    }
    setLoading(false);
  }

  async function google() {
    await createSupabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback() },
    });
  }

  const other = mode === "signup" ? "/entrar" : "/criar-conta";

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Logo size={34} />
        <p className="sub">
          {mode === "signup" ? "Crie sua conta grátis e ganhe 3 mapas" : "Que bom te ver de novo"}
        </p>
        <form onSubmit={submit}>
          <input className="field" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <input className="field" type="password" placeholder="Senha (mínimo 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          {error && <p className="auth-msg">{error}</p>}
          {info && <p className="auth-ok">{info}</p>}
          <button className="white-btn" disabled={loading}>
            {loading ? "Aguarde…" : mode === "signup" ? "Criar conta" : "Entrar"}
          </button>
        </form>
        {process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "true" && (<>
        <div style={{ height: 12 }} />
        <button className="google-btn" onClick={google} type="button">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          Continuar com Google
        </button>
        </>)}
        <p className="switch">
          {mode === "signup" ? "Já tem uma conta? " : "Ainda não tem conta? "}
          <Link href={`${other}?next=${encodeURIComponent(next)}`}>{mode === "signup" ? "Entrar" : "Criar conta grátis"}</Link>
        </p>
      </div>
      <p style={{ color: "#71717a", fontSize: 13, marginTop: 24 }}>
        Ao criar sua conta, você concorda com os Termos de Uso.
      </p>
    </main>
  );
}

function traduz(msg: string) {
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Clique em Entrar.";
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}
