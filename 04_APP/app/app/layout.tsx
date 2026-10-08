import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo, { LogoMark } from "@/components/Logo";
import { getCurrentUser } from "@/lib/supa/server";
import { IconCrown, IconDashboard, IconHelp, IconLogout, IconMaps, IconSettings, IconSparkles } from "@/components/Icons";

export const dynamic = "force-dynamic";

// Menu lateral recolhido (só ícones) que abre ao passar o mouse.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/app" className="side-brand">
          <span className="only-collapsed"><LogoMark size={30} /></span>
          <span className="only-open"><Logo size={28} /></span>
        </Link>
        <Link href="/app" className="side-link"><IconDashboard /><span>Início</span></Link>
        <Link href="/app?criar=1" className="side-link"><IconSparkles /><span>Criar mapa</span></Link>
        <Link href="/app/mapas" className="side-link"><IconMaps /><span>Meus mapas</span></Link>
        <Link href="/app/configuracoes" className="side-link"><IconSettings /><span>Configurações</span></Link>
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
    </div>
  );
}
