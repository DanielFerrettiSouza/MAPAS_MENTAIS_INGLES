import { redirect } from "next/navigation";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import { planName } from "@/lib/plans";
import { CURRICULUM } from "@/lib/curriculum";
import LibraryGenerator from "@/components/LibraryGenerator";

export const dynamic = "force-dynamic";

type Profile = { id: string; email: string | null; name: string | null; plan: string; credits: number; created_at?: string };
type MapRow = { user_id: string; created_at: string };

const DAY = 86400000;
const fmt = (d: Date) => d.toISOString().slice(0, 10);

// Painel do dono: funil (contas → mapas → sem créditos → pagantes) e lista de pessoas.
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user?.email)) redirect("/app");

  const admin = createSupabaseAdmin();
  const [{ data: profiles }, { data: maps }, { data: authData }] = await Promise.all([
    admin.from("profiles").select("id, email, name, plan, credits"),
    admin.from("generated_maps").select("user_id, created_at").order("created_at", { ascending: false }).limit(10000),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const { count: libCount } = await admin.from("library_maps").select("slug", { count: "exact", head: true });

  const created = new Map((authData?.users ?? []).map((u) => [u.id, u.created_at]));
  const people: Profile[] = (profiles ?? []).map((p) => ({ ...p, created_at: created.get(p.id) }));
  const allMaps: MapRow[] = maps ?? [];
  const planOf = new Map(people.map((p) => [p.id, p.plan]));
  const mapsBy = new Map<string, number>();
  allMaps.forEach((m) => mapsBy.set(m.user_id, (mapsBy.get(m.user_id) ?? 0) + 1));

  const now = Date.now();
  const since = (days: number) => (iso?: string) => !!iso && now - new Date(iso).getTime() < days * DAY;
  const periods = [
    { label: "Hoje", test: (iso?: string) => !!iso && fmt(new Date(iso)) === fmt(new Date()) },
    { label: "7 dias", test: since(7) },
    { label: "30 dias", test: since(30) },
    { label: "Total", test: () => true },
  ];

  const paying = people.filter((p) => p.plan !== "free");
  const freeOut = people.filter((p) => p.plan === "free" && p.credits <= 0);
  const withMap = people.filter((p) => (mapsBy.get(p.id) ?? 0) > 0);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

  // Últimos 14 dias
  const days = Array.from({ length: 14 }, (_, i) => fmt(new Date(now - i * DAY)));
  const byDay = days.map((d) => {
    const ms = allMaps.filter((m) => fmt(new Date(m.created_at)) === d);
    return {
      d,
      signups: people.filter((p) => p.created_at && fmt(new Date(p.created_at)) === d).length,
      maps: ms.length,
      free: ms.filter((m) => planOf.get(m.user_id) === "free").length,
      users: new Set(ms.map((m) => m.user_id)).size,
    };
  });

  const stage = (p: Profile) =>
    p.plan !== "free" ? `💳 ${planName(p.plan)}` : p.credits <= 0 ? "🔥 Usou os grátis" : (mapsBy.get(p.id) ?? 0) > 0 ? "🗺️ Gerou mapa" : "👤 Só criou conta";
  const list = [...people].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 200);

  return (
    <>
      <h1 className="app-hello">Painel <span className="grad-text">admin</span></h1>
      <p className="app-sub">Funil e uso do app. Contas criadas → geraram mapa → usaram os grátis → assinaram.</p>

      <div className="admin-funnel">
        <div><strong>{people.length}</strong><span>contas</span></div>
        <div><strong>{withMap.length}</strong><span>geraram mapa · {pct(withMap.length, people.length)}</span></div>
        <div><strong>{freeOut.length}</strong><span>usaram os grátis (sem plano)</span></div>
        <div><strong>{paying.length}</strong><span>pagantes · {pct(paying.length, people.length)}</span></div>
      </div>

      <h2 className="admin-h">Biblioteca pronta (planos Fluente e Professor)</h2>
      <LibraryGenerator ready={libCount ?? 0} total={CURRICULUM.length} />

      <h2 className="admin-h">Por período</h2>
      <table className="admin-table">
        <thead><tr><th></th>{periods.map((p) => <th key={p.label}>{p.label}</th>)}</tr></thead>
        <tbody>
          <tr><td>Contas novas</td>{periods.map((p) => <td key={p.label}>{people.filter((x) => p.test(x.created_at)).length}</td>)}</tr>
          <tr><td>Mapas gerados</td>{periods.map((p) => <td key={p.label}>{allMaps.filter((m) => p.test(m.created_at)).length}</td>)}</tr>
          <tr><td>· por usuários grátis</td>{periods.map((p) => <td key={p.label}>{allMaps.filter((m) => p.test(m.created_at) && planOf.get(m.user_id) === "free").length}</td>)}</tr>
          <tr><td>· por pagantes</td>{periods.map((p) => <td key={p.label}>{allMaps.filter((m) => p.test(m.created_at) && planOf.get(m.user_id) !== "free").length}</td>)}</tr>
        </tbody>
      </table>
      <p className="admin-note">Grátis/pago considera o plano atual da pessoa. Custo por mapa = gasto do dia (Claude + Google) ÷ mapas do dia.</p>

      <h2 className="admin-h">Últimos 14 dias</h2>
      <table className="admin-table">
        <thead><tr><th>Dia</th><th>Contas</th><th>Mapas</th><th>Grátis</th><th>Pessoas</th></tr></thead>
        <tbody>{byDay.map((r) => <tr key={r.d}><td>{r.d.split("-").reverse().join("/")}</td><td>{r.signups}</td><td>{r.maps}</td><td>{r.free}</td><td>{r.users}</td></tr>)}</tbody>
      </table>

      <h2 className="admin-h">Pessoas (mais recentes)</h2>
      <div className="admin-scroll">
        <table className="admin-table">
          <thead><tr><th>E-mail</th><th>Nome</th><th>Criou em</th><th>Estágio</th><th>Mapas</th><th>Créditos</th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id}>
              <td>{p.email}</td><td>{p.name}</td>
              <td>{p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : "—"}</td>
              <td>{stage(p)}</td><td>{mapsBy.get(p.id) ?? 0}</td><td>{p.credits}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
