import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { getCurrentUser } from "@/lib/supa/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/app" className="logo"><Logo size={28} /></Link>
        <Link href="/app" className="side-link">🏠 <span>Início</span></Link>
        <Link href="/app#meus-mapas" className="side-link">🗺️ <span>Meus mapas</span></Link>
        <Link href="/app/planos" className="side-link">💎 <span>Planos</span></Link>
        <div className="spacer" />
        <Link href="/app/planos" className="side-link upgrade primary-btn grad-btn">👑 Assinar plano</Link>
        <form action="/auth/sair" method="post">
          <button className="side-link">↪ <span>Sair</span></button>
        </form>
        <div className="user">{user.email}</div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
