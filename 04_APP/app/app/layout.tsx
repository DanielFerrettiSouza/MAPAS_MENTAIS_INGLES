import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo, { LogoMark } from "@/components/Logo";
import { createSupabaseAdmin, getCurrentUser, getProfile } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import RegistrationPixel from "@/components/RegistrationPixel";
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/app" className="side-brand">
          <span className="only-collapsed"><LogoMark size={30} /></span>
          <span className="only-open"><Logo size={28} /></span>
        </Link>
        <Link href="/app" className="side-link"><IconDashboard /><span>Início</span></Link>
        <Link href="/app/criar" className="side-link"><IconSparkles /><span>Criar mapa</span></Link>
        <Link href="/app/mapas" className="side-link"><IconMaps /><span>Meus mapas</span></Link>
        <Link href="/app/biblioteca" className="side-link"><IconBook /><span>Biblioteca</span></Link>
        <Link href="/app/plano" className="side-link"><IconCalendar /><span>Meu plano</span></Link>
        <Link href="/app/kits" className="side-link"><IconMaps /><span>Kits</span></Link>
        <Link href="/app/audiobooks" className="side-link"><IconBook /><span>Audiobooks</span></Link>
        <Link href="/app/configuracoes" className="side-link"><IconSettings /><span>Configurações</span></Link>
        {isAdmin(user.email) && <Link href="/app/admin" className="side-link"><IconDashboard /><span>Admin</span></Link>}
        <a href="mailto:mapasmentaisfalantes@gmail.com" className="side-link"><IconHelp /><span>Suporte</span></a>
        <div className="spacer" />
        <Link href="/app/planos" className="side-link upgrade"><IconCrown /><span>Assinar plano</span></Link>
        <form action="/auth/sair" method="post">
          <button className="side-link"><IconLogout /><span>Sair</span></button>
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
