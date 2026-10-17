import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { canTeach } from "@/lib/teacher";
import { AULAS } from "@/lib/aulas";
import { AUDIOBOOKS } from "@/lib/audiobooks";
import ClassLinkButton from "@/components/ClassLinkButton";

export const dynamic = "force-dynamic";

export default async function AulasPage() {
  const user = (await getCurrentUser())!;
  if (!canTeach((await getProfile(user.id))?.plan, user.email)) redirect("/app/planos");
  return (
    <>
      <h1 className="app-hello">📦 Aula <span className="grad-text">pronta</span></h1>
      <p className="app-sub">Toda semana: um audiobook, um mapa do mesmo tema e a atividade para imprimir. É só abrir e dar a aula.</p>
      {AULAS.map((a) => {
        const book = AUDIOBOOKS.find((b) => b.id === a.audiobook);
        return (
          <section key={a.id} className="settings-card" style={{ marginTop: 20 }}>
            <p className="app-sub" style={{ margin: 0 }}>{a.semana} · nível {a.nivel}</p>
            <h2 style={{ margin: "4px 0 10px" }}>{a.titulo}</h2>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>{a.roteiro.map((r) => <li key={r}>{r}</li>)}</ol>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              <Link href={`/app/audiobooks/${a.audiobook}`} className="primary-btn grad-btn">🎧 {book?.title_en ?? "Audiobook"}</Link>
              <Link href={`/app/biblioteca/${a.mapa}`} className="ghost-btn">🗺️ Abrir o mapa</Link>
              <a href={`/imprimir/biblioteca/${a.mapa}`} target="_blank" rel="noopener" className="ghost-btn">🖨️ Atividade para imprimir</a>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              <ClassLinkButton tipo="audiobook" id={a.audiobook} />
              <ClassLinkButton tipo="biblioteca" id={a.mapa} />
            </div>
          </section>
        );
      })}
    </>
  );
}
