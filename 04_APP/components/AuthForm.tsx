"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "./Logo";
import { createSupabaseBrowser } from "@/lib/supa/client";

export default function AuthForm({ mode, lang }: { mode: "signup" | "login"; lang?: "es" }) {
  const es = lang === "es";
  const t = (pt: string, sp: string) => (es ? sp : pt);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";
  // Vindo da página de obrigado da Kiwify (?comprou=1): a pessoa já pagou.
  const bought = params.get("comprou") === "1" || params.get("compro") === "1";
  // Versão em espanhol: guarda o idioma (cookie + cadastro) para o app abrir em espanhol.
  useEffect(() => {
    if (es) document.cookie = "mf-lang=es; path=/; max-age=31536000; samesite=lax";
  }, [es]);
  const [email, setEmail] = useState("");
  // E-mail que a pessoa digitou no fim do quiz já vem preenchido no cadastro.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mf-email");
      if (saved) setEmail((cur) => cur || saved);
    } catch {}
  }, []);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  function startCooldown() {
    setWait(60);
    const t = setInterval(() => setWait((w) => { if (w <= 1) clearInterval(t); return w - 1; }), 1000);
  }

  // Reenvia o e-mail de confirmação (aguarda 60s entre envios).
  async function resend() {
    if (!sentTo || wait > 0) return;
    setError(null);
    const { error } = await createSupabaseBrowser().auth.resend({
      type: "signup",
      email: sentTo,
      options: { emailRedirectTo: callback() },
    });
    if (error) setError(traduz(error.message, es));
    else setInfo(t(`Enviamos de novo para ${sentTo}. Confira também a caixa de spam e "Promoções".`, `Lo enviamos de nuevo a ${sentTo}. Revisa también la carpeta de spam y "Promociones".`));
    startCooldown();
  }

  // Esqueci a senha: manda um link que entra na conta e abre Configurações para criar senha nova.
  async function forgot() {
    setError(null);
    setInfo(null);
    if (!email) {
      setError(t("Digite seu e-mail acima e clique de novo em \"Esqueci minha senha\".", "Escribe tu correo arriba y haz clic de nuevo en \"Olvidé mi contraseña\"."));
      return;
    }
    const { error } = await createSupabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/app/configuracoes?nova-senha=1")}`,
    });
    if (error) setError(traduz(error.message, es));
    else setInfo(t(`Enviamos um link para ${email}. Abra o e-mail, clique no link e crie uma senha nova (confira também o spam). Se você costuma entrar pelo Google, use o botão "Continuar com Google".`, `Enviamos un enlace a ${email}. Abre el correo, haz clic en el enlace y crea una contraseña nueva (revisa también el spam). Si sueles entrar con Google, usa el botón "Continuar con Google".`));
  }

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
        options: { emailRedirectTo: callback(), data: es ? { lang: "es" } : undefined },
      });
      if (error) setError(traduz(error.message, es));
      else if (!data.session) {
        setInfo(t(`Quase lá! Enviamos um link para ${email}. Clique nele para ativar a conta (confira também o spam).`, `¡Casi listo! Enviamos un enlace a ${email}. Haz clic en él para activar tu cuenta (revisa también el spam).`));
        setSentTo(email);
        startCooldown();
      }
      else router.push(next);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error && /email not confirmed/i.test(error.message)) setSentTo(email);
      if (error) setError(traduz(error.message, es));
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

  const other = es ? (mode === "signup" ? "/es/entrar" : "/es/crear-cuenta") : mode === "signup" ? "/entrar" : "/criar-conta";

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Logo size={34} lang={lang} />
        <p className="sub">
          {bought
            ? mode === "signup"
              ? t("🎉 Pagamento confirmado! Crie sua conta com o mesmo e-mail da compra para liberar o seu Método.", "🎉 ¡Pago confirmado! Crea tu cuenta con el mismo correo de la compra para activar tu Método.")
              : t("🎉 Pagamento confirmado! Entre com o mesmo e-mail da compra para acessar o seu Método.", "🎉 ¡Pago confirmado! Entra con el mismo correo de la compra para acceder a tu Método.")
            : mode === "signup" ? t("Crie sua conta grátis e ganhe 3 mapas", "Crea tu cuenta gratis y recibe 3 mapas") : t("Que bom te ver de novo", "Qué bueno verte de nuevo")}
        </p>
        <form onSubmit={submit}>
          <input className="field" type="email" placeholder={t("E-mail", "Correo electrónico")} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <input className="field" type="password" placeholder={t("Senha (mínimo 6 caracteres)", "Contraseña (mínimo 6 caracteres)")} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoComplete={mode === "signup" ? "new-password" : "current-password"} />
          {error && <p className="auth-msg">{error}</p>}
          {info && <p className="auth-ok">{info}</p>}
          {sentTo && (
            <button type="button" className="link-btn" onClick={resend} disabled={wait > 0}>
              {wait > 0 ? t(`Não recebeu? Reenviar em ${wait}s`, `¿No te llegó? Reenviar en ${wait}s`) : t("Não recebeu? Reenviar e-mail de confirmação", "¿No te llegó? Reenviar correo de confirmación")}
            </button>
          )}
          {mode === "login" && (
            <button type="button" className="link-btn" onClick={forgot}>{t("Esqueci minha senha", "Olvidé mi contraseña")}</button>
          )}
          <button className="white-btn" disabled={loading}>
            {loading ? t("Aguarde…", "Espera…") : mode === "signup" ? t("Criar conta", "Crear cuenta") : t("Entrar", "Entrar")}
          </button>
        </form>
        {process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "true" && (<>
        <div style={{ height: 12 }} />
        <button className="google-btn" onClick={google} type="button">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          {t("Continuar com Google", "Continuar con Google")}
        </button>
        </>)}
        <p className="switch">
          {mode === "signup" ? t("Já tem uma conta? ", "¿Ya tienes cuenta? ") : t("Ainda não tem conta? ", "¿Aún no tienes cuenta? ")}
          <Link href={`${other}?next=${encodeURIComponent(next)}${bought ? "&comprou=1" : ""}`}>{mode === "signup" ? t("Entrar", "Entrar") : t("Criar conta grátis", "Crear cuenta gratis")}</Link>
        </p>
      </div>
      <p style={{ color: "#71717a", fontSize: 13, marginTop: 24 }}>
        {t("Ao criar sua conta, você concorda com os ", "Al crear tu cuenta, aceptas los ")}<Link href={es ? "/es/terminos" : "/termos"} style={{ color: "#a1a1aa" }}>{t("Termos de Uso", "Términos de Uso")}</Link>{t(" e a ", " y la ")}<Link href={es ? "/es/privacidad" : "/privacidade"} style={{ color: "#a1a1aa" }}>{t("Política de Privacidade", "Política de Privacidad")}</Link>.
      </p>
    </main>
  );
}

function traduz(msg: string, es = false) {
  if (es) {
    if (/already registered/i.test(msg)) return "Este correo ya tiene cuenta. Haz clic en Entrar.";
    if (/invalid login/i.test(msg)) return "Correo o contraseña incorrectos.";
    if (/email not confirmed/i.test(msg)) return "Confirma tu correo con el enlace que te enviamos antes de entrar.";
    if (/sending.*email|confirmation email/i.test(msg)) return "No pudimos enviar el correo ahora. Inténtalo de nuevo en unos minutos.";
    if (/rate limit|only request this after|security purposes/i.test(msg)) return "Demasiados envíos seguidos. Espera un minuto e inténtalo de nuevo.";
    if (/password/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
    return msg;
  }
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Clique em Entrar.";
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (/sending.*email|confirmation email/i.test(msg)) return "Não conseguimos enviar o e-mail agora. Tente de novo em alguns minutos ou entre com o Google.";
  if (/rate limit|only request this after|security purposes/i.test(msg)) return "Muitos envios seguidos. Aguarde um minuto e tente de novo.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}
