import { notFound, redirect } from "next/navigation";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

type Post = { id: string; title: string; slides: string[] };

// Versão para imprimir de um Mapa do dia: uma parte por folha.
export default async function PrintMapaDoDia({ params }: { params: { id: string } }) {
  if (!(await getCurrentUser())) redirect("/entrar");
  const { data } = await createSupabaseAdmin().storage.from("map-images").download("posts/index.json");
  const post = (data ? (JSON.parse(await data.text()) as Post[]) : []).find((p) => p.id === params.id);
  if (!post) notFound();
  return (
    <div className="pr-page">
      <div className="no-print" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <PrintButton />
        <span className="app-sub">{post.title}: {post.slides.length} folhas, uma parte por página.</span>
      </div>
      {post.slides.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt={`${post.title} — parte ${i + 1}`} className={i ? "pr-break" : ""} style={{ display: "block", width: "100%", maxWidth: 640, margin: "0 auto 24px" }} />
      ))}
    </div>
  );
}
