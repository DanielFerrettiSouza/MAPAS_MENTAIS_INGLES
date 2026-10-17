import { notFound, redirect } from "next/navigation";
import { createSupabaseAdmin, createSupabaseServer, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canTeach, teacherName } from "@/lib/teacher";
import type { MapWithImages } from "@/lib/mapSchema";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Atividade para imprimir" };

// Folha de atividade do plano Professor: mapa + exercícios + revisão, com o nome
// do professor no topo e o gabarito numa página separada.
export default async function PrintPage({ params }: { params: { tipo: string; id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const profile = await getProfile(user.id);
  if (!canTeach(profile?.plan, user.email)) redirect("/app/planos");

  let map: MapWithImages | null = null;
  if (params.tipo === "meu") {
    const { data } = await createSupabaseServer().from("generated_maps").select("data").eq("id", params.id).maybeSingle();
    map = (data?.data as MapWithImages) ?? null;
  } else if (params.tipo === "biblioteca") {
    const { data } = await createSupabaseAdmin().from("library_maps").select("data").eq("slug", params.id).maybeSingle();
    map = (data?.data as MapWithImages) ?? null;
  }
  if (!map) notFound();

  const name = teacherName(user);
  const letters = ["a", "b", "c", "d"];
  const header = (
    <header className="pr-head">
      <div>
        <strong>{name || "Material de inglês"}</strong>
        <span>Nível {map.level}</span>
      </div>
      <div className="pr-student">Aluno(a): ______________________________ Data: ___/___/_____</div>
    </header>
  );

  return (
    <main className="pr-page">
      <div className="pr-bar no-print">
        <PrintButton />
        {!name && <span>Dica: coloque o seu nome em Configurações → Material para a turma.</span>}
      </div>

      <section className="pr-sheet">
        {header}
        <h1>{map.emoji} {map.title_en} <small>· {map.title_pt}</small></h1>
        <p className="pr-summary">{map.summary_pt}</p>

        <div className="pr-branches">
          {map.branches.map((b) => (
            <div key={b.label_en} className="pr-branch">
              <h2>{b.emoji} {b.label_en} <small>· {b.label_pt}</small></h2>
              <ul>{b.items.map((i) => <li key={i.en}><b>{i.en}</b> — {i.pt}</li>)}</ul>
            </div>
          ))}
        </div>

        <div className="pr-box"><b>💡 Dica:</b> {map.tip_pt}</div>
        <div className="pr-box"><b>⚠️ Erro comum:</b> <s>{map.common_mistake.wrong}</s> → <b>{map.common_mistake.right}</b> <span>({map.common_mistake.why_pt})</span></div>

        <h2 className="pr-sec">✏️ Complete as frases</h2>
        <ol className="pr-ex">
          {map.exercises.map((e) => <li key={e.sentence}>{e.sentence.replace(/_{2,}/g, "______________")} <span>{e.hint_pt}</span></li>)}
        </ol>

        <h2 className="pr-sec">✅ Revisão</h2>
        <ol className="pr-quiz">
          {map.quiz.map((q) => (
            <li key={q.question_pt}>
              {q.question_pt}
              <div>{q.options.map((o, i) => <span key={o}>( ) {letters[i]}) {o}</span>)}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pr-sheet pr-break">
        <header className="pr-head"><div><strong>{name || "Material de inglês"}</strong><span>Gabarito · {map.title_en}</span></div></header>
        <h2 className="pr-sec">✏️ Complete as frases</h2>
        <ol className="pr-ex">{map.exercises.map((e) => <li key={e.sentence}>{e.sentence.replace(/_{2,}/g, e.answer)}</li>)}</ol>
        <h2 className="pr-sec">✅ Revisão</h2>
        <ol className="pr-quiz">{map.quiz.map((q) => <li key={q.question_pt}>{letters[q.answer_index]}) {q.options[q.answer_index]}</li>)}</ol>
      </section>
    </main>
  );
}
