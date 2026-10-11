import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { canUseLibrary } from "@/lib/library";
import { BONUS } from "@/lib/bonus";
import BonusList from "@/components/BonusList";
import LibraryLocked from "@/components/LibraryLocked";

export const dynamic = "force-dynamic";

// Bônus do método. Sem acesso: o 1º tema fica aberto como amostra.
export default async function BonusPage({ params }: { params: { colecao: string } }) {
  const b = BONUS[params.colecao];
  if (!b) notFound();
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const unlocked = canUseLibrary(profile?.plan, user);
  const sections = unlocked ? b.sections : b.sections.slice(0, 1);
  return (
    <>
      <Link href="/app/biblioteca" className="back-link">← Voltar à biblioteca</Link>
      <h1 className="app-hello">{b.emoji} {b.title}</h1>
      <p className="app-sub">{b.text} Toque no ▶ para ouvir a pronúncia de nativo.</p>
      {!unlocked && <LibraryLocked what={`Os ${b.title} completos`} email={user.email} sample />}
      <BonusList sections={sections} locked={0} />
      {!unlocked && <p className="app-sub" style={{ marginTop: 20 }}>🔒 Mais {b.sections.length - 1} temas no Plano Fluente.</p>}
    </>
  );
}
