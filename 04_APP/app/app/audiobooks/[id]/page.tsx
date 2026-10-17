import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { isAdmin } from "@/lib/admin";
import { AUDIOBOOKS, canUseAudiobooks } from "@/lib/audiobooks";
import AudiobookPlayer from "@/components/AudiobookPlayer";

export const dynamic = "force-dynamic";

export default async function AudiobookPage({ params }: { params: { id: string } }) {
  const book = AUDIOBOOKS.find((a) => a.id === params.id);
  if (!book) notFound();
  const user = (await getCurrentUser())!;
  if (!canUseAudiobooks((await getProfile(user.id))?.plan) && !isAdmin(user.email)) redirect("/app/planos");
  return (
    <>
      <p className="app-sub">🎧 Audiobook · nível {book.level}</p>
      <h1 className="app-hello">{book.title_en}</h1>
      <p className="app-sub">{book.title_pt}</p>
      <AudiobookPlayer audio={book.audio} duration={book.duration} sentences={book.sentences} />
    </>
  );
}
