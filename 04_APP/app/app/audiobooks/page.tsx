import Link from "next/link";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import { AUDIOBOOKS, canUseAudiobooks } from "@/lib/audiobooks";

export const dynamic = "force-dynamic";

export default async function AudiobooksPage() {
  const user = (await getCurrentUser())!;
  const open = canUseAudiobooks((await getProfile(user.id))?.plan) || isAdmin(user.email);
  return (
    <>
      <h1 className="app-hello">🎧 <span className="grad-text">Audiobooks</span></h1>
      <p className="app-sub">Histórias curtas com áudio de nativo, frase a frase, com a tradução ao lado.</p>
      {!open && (
        <div className="out-banner">
          <p>Os audiobooks fazem parte das assinaturas Essencial, Fluente e Professor.</p>
          <Link href="/app/planos" className="primary-btn grad-btn">Ver planos →</Link>
        </div>
      )}
      <div className="ab-list">
        {AUDIOBOOKS.map((a) => (
          <Link key={a.id} href={open ? `/app/audiobooks/${a.id}` : "/app/planos"} className="ab-card">
            <span className="ab-level">{a.level}</span>
            <h3>{a.title_en}</h3>
            <p>{a.title_pt}</p>
            <small>{a.summary_pt}</small>
            <span className="ab-go">{open ? "▶ Ouvir" : "🔒 Assine para ouvir"}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
