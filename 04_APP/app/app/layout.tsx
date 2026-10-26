import { canTeach } from "@/lib/teacher";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo, { LogoMark } from "@/components/Logo";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import RegistrationPixel from "@/components/RegistrationPixel";
import { getLang, tr } from "@/lib/lang";
import { IconCrown, IconDashboard, IconHelp, IconLogout, IconMaps, IconSettings, IconSparkles, IconBook, IconCalendar } from "@/components/Icons";

export const dynamic = "force-dynamic";

// Menu lateral recolhido (só ícones) que abre ao passar o mouse.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  // Comprou a biblioteca antes de criar a conta: vira acesso vitalício e plano grátis.
  const profile = await getProfile(user.id);
  // Kits comprados junto aparecem como "|kit-viagem" etc.
  const parts = profile?.plan?.split("|") ?? [];
  if (parts.includes("biblioteca") || parts.some((p) => p.startsWith("kit-"))) {
    const admin = createSupabaseAdmin();
    const kits = parts.filter((p) => p.startsWith("kit-")).map((p) => p.slice(4));
    const had = Array.isArray(user.app_metadata?.kits) ? (user.app_metadata.kits as string[]) : [];
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...(parts.includes("biblioteca") ? { library: true } : {}), ...(kits.length ? { kits: [...new Set([...had, ...kits])] } : {}) },
    });
    const base = parts[0] === "biblioteca" || parts[0].startsWith("kit-") ? "free" : parts[0];
    await admin.from("profiles").update({ plan: base }).eq("id", user.id);
    // Comprou o Método: o primeiro passo é o teste de nível.
    redirect(parts.includes("biblioteca") ? "/app/nivel" : "/app/kits");
  }
  // Dono do app: plano completo e créditos sempre cheios, para testar sem criar contas novas.
  if (isAdmin(user.email) && profile && (profile.plan !== "professor" || profile.credits < 100)) {
    await createSupabaseAdmin().from("profiles").update({ plan: "professor", credits: 999 }).eq("id", user.id);
  }

  // Clientes da versão em espanhol: menu em espanhol, sem as ofertas e áudios que só existem em português.
  const lang = getLang(user);
  const es = lang === "es";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/app" className="side-brand">
          <span className="only-collapsed"><LogoMark size={30} /></span>
          <span className="only-open"><Logo size={28} lang={lang} /></span>
        </Link>
        <Link href="/app" className="side-link"><IconDashboard /><span>{tr(lang, "Início", "Inicio")}</span></Link>
        <Link href="/app/criar" className="side-link"><IconSparkles /><span>{tr(lang, "Criar mapa", "Crear mapa")}</span></Link>
        <Link href="/app/mapas" className="side-link"><IconMaps /><span>{tr(lang, "Meus mapas", "Mis mapas")}</span></Link>
        <Link href="/app/biblioteca" className="side-link"><IconBook /><span>Biblioteca</span></Link>
        <Link href="/app/plano" className="side-link"><IconCalendar /><span>{tr(lang, "Meu plano", "Mi plan")}</span></Link>
        <Link href="/app/kits" className="side-link"><IconMaps /><span>Kits</span></Link>
        {!es && <Link href="/app/audiobooks" className="side-link"><IconBook /><span>Audiobooks</span></Link>}
        {!es && <Link href="/app/mapa-do-dia" className="side-link"><IconCalendar /><span>Mapa do dia</span></Link>}
        {!es && canTeach(profile?.plan, user.email) && <Link href="/app/aulas" className="side-link"><IconCalendar /><span>Aula pronta</span></Link>}
        <Link href="/app/configuracoes" className="side-link"><IconSettings /><span>{tr(lang, "Configurações", "Configuración")}</span></Link>
        {!es && isAdmin(user.email) && <Link href="/app/admin" className="side-link"><IconDashboard /><span>Admin</span></Link>}
        <a href="mailto:mapasmentaisfalantes@gmail.com" className="side-link"><IconHelp /><span>{tr(lang, "Suporte", "Soporte")}</span></a>
        <div className="spacer" />
        {!es && <Link href="/app/planos" className="side-link upgrade"><IconCrown /><span>Assinar plano</span></Link>}
        <form action="/auth/sair" method="post">
          <button className="side-link"><IconLogout /><span>{tr(lang, "Sair", "Salir")}</span></button>
        </form>
        <div className="user">
          <span className="avatar">{user.email?.[0]?.toUpperCase()}</span>
          <span className="only-open">{user.email}</span>
        </div>
      </aside>
      <main className="app-main">{children}</main>
      <RegistrationPixel userId={user.id} isNew={Date.now() - new Date(user.created_at).getTime() < 30 * 60 * 1000} />
    </div>
  );
}
