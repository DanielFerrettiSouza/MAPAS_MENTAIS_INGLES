import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import { AUDIOBOOKS, canUseAudiobooks } from "@/lib/audiobooks";
import AudiobookPlayer from "@/components/AudiobookPlayer";
import ClassLinkButton from "@/components/ClassLinkButton";
import { canTeach } from "@/lib/teacher";

export const dynamic = "force-dynamic";

export default async function AudiobookPage({ params, searchParams }: { params: { id: string }; searchParams: { de?: string } }) {
  const book = AUDIOBOOKS.find((a) => a.id === params.id);
  if (!book) notFound();
  const user = (await getCurrentUser())!;
  const plan = (await getProfile(user.id))?.plan;
  if (!canUseAudiobooks(plan) && !isAdmin(user.email)) redirect("/app/planos");
  return (
    <>
      {searchParams.de === "aula"
        ? <Link href="/app/aulas" className="back-link">← Voltar à aula pronta</Link>
        : <Link href="/app/audiobooks" className="back-link">← Voltar aos audiobooks</Link>}
      <p className="app-sub">🎧 Audiobook · nível {book.level}</p>
      <h1 className="app-hello">{book.title_en}</h1>
      <p className="app-sub">{book.title_pt}</p>
      {canTeach(plan, user.email) && <ClassLinkButton tipo="audiobook" id={book.id} />}
      <AudiobookPlayer audio={book.audio} duration={book.duration} sentences={book.sentences} />
    </>
  );
}
