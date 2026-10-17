import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supa/server";
import { validClassLink } from "@/lib/share";
import { AUDIOBOOKS } from "@/lib/audiobooks";
import MindMapView from "@/components/MindMapView";
import AudiobookPlayer from "@/components/AudiobookPlayer";
import type { MapWithImages } from "@/lib/mapSchema";

export const dynamic = "force-dynamic";
export const metadata = { title: "Material da turma · Mapas Falantes", robots: { index: false } };

// Página aberta do link da turma: o aluno ouve no celular, sem criar conta.
export default async function ClassPage({ params }: { params: { tipo: string; id: string; k: string } }) {
  const id = decodeURIComponent(params.id);
  if (!validClassLink(params.tipo, id, params.k)) notFound();

  let body: React.ReactNode = null;
  if (params.tipo === "audiobook") {
    const book = AUDIOBOOKS.find((a) => a.id === id);
    if (!book) notFound();
    body = (
      <>
        <p className="app-sub">🎧 Audiobook · nível {book.level}</p>
        <h1 className="app-hello">{book.title_en}</h1>
        <p className="app-sub">{book.title_pt}</p>
        <AudiobookPlayer audio={book.audio} duration={book.duration} sentences={book.sentences} />
      </>
    );
  } else {
    const admin = createSupabaseAdmin();
    const { data } = params.tipo === "meu"
      ? await admin.from("generated_maps").select("data").eq("id", id).maybeSingle()
      : await admin.from("library_maps").select("data").eq("slug", id).maybeSingle();
    if (!data) notFound();
    body = <MindMapView map={data.data as MapWithImages} />;
  }

  return (
    <main className="wrap" style={{ padding: "24px 16px 60px" }}>
      <p className="app-sub" style={{ marginBottom: 16 }}>📚 Material da sua turma · toque nas frases para ouvir</p>
      {body}
      <p className="app-sub" style={{ marginTop: 32, textAlign: "center" }}>Feito com <a href="/metodo" style={{ color: "var(--accent)" }}>Mapas Falantes</a></p>
    </main>
  );
}
