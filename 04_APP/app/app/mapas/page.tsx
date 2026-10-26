import Link from "next/link";
import MapGrid, { type MapRow } from "@/components/MapGrid";
import { createSupabaseServer, getCurrentUser } from "@/lib/supa/server";
import { getLang, tr } from "@/lib/lang";

export const dynamic = "force-dynamic";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default async function MyMaps({ searchParams }: { searchParams: { nivel?: string } }) {
  const nivel = LEVELS.includes(searchParams.nivel ?? "") ? searchParams.nivel : undefined;
  let query = createSupabaseServer()
    .from("generated_maps")
    .select("id, title_pt, topic, level, created_at, data")
    .order("created_at", { ascending: false });
  if (nivel) query = query.eq("level", nivel);
  const { data: maps } = await query;
  const lang = getLang(await getCurrentUser());

  return (
    <>
      <h1 className="app-hello">{tr(lang, "Meus mapas", "Mis mapas")}</h1>
      <p className="app-sub">{tr(lang, "Revise quando quiser: toque nas frases para ouvir de novo e refaça os exercícios.", "Repasa cuando quieras: toca las frases para escucharlas de nuevo y rehaz los ejercicios.")}</p>
      <div className="chips">
        <Link href="/app/mapas" className={`chip ${!nivel ? "chip-on" : ""}`}>{tr(lang, "Todos", "Todos")}</Link>
        {LEVELS.map((l) => (
          <Link key={l} href={`/app/mapas?nivel=${l}`} className={`chip ${nivel === l ? "chip-on" : ""}`}>{l}</Link>
        ))}
      </div>
      <MapGrid maps={(maps ?? []) as MapRow[]} lang={lang} />
    </>
  );
}
