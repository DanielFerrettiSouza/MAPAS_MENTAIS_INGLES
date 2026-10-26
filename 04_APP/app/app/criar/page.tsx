import { Suspense } from "react";
import { redirect } from "next/navigation";
import Generator from "@/components/Generator";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { getLang, tr } from "@/lib/lang";

export const dynamic = "force-dynamic";

// Página só para criar mapas (as sugestões do diagnóstico chegam aqui com o tema preenchido).
export default async function CreatePage({ searchParams }: { searchParams: { compro?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const credits = profile?.credits ?? 0;
  const lang = getLang(user);
  if (lang !== "es" && (profile?.plan ?? "free") === "free" && credits <= 0) redirect("/app/planos");
  return (
    <>
      <div className="app-top">
        <span className="credit-pill"><b>{credits}</b> {lang === "es" ? (credits === 1 ? "mapa con IA restante" : "mapas con IA restantes") : credits === 1 ? "mapa restante" : "mapas restantes"}</span>
      </div>
      <h1 className="app-hello">{tr(lang, "Criar", "Crear")} <span className="grad-text">{tr(lang, "novo mapa", "nuevo mapa")}</span></h1>
      <p className="app-sub">
        {tr(lang, "Digite um assunto (ex.: \"pedir comida no restaurante\", \"phrasal verbs de trabalho\", a letra de uma música) e escolha seu nível.", "Escribe un tema (ej.: \"pedir comida en el restaurante\", \"phrasal verbs de trabajo\", la letra de una canción) y elige tu nivel.")}
      </p>
      {searchParams.compro === "1" && lang === "es" && (
        <p className="auth-ok">🎉 ¡Pago confirmado! Tus 5 mapas con IA ya están en tu cuenta (si no ves los créditos, recarga la página en unos segundos).</p>
      )}
      <Suspense>
        <Generator
          credits={credits}
          autoFocus
          lang={lang}
          defaultLevel={(user.user_metadata?.level as string) ?? (user.user_metadata?.quiz?.level as string) ?? "A1"}
          defaultGoal={(user.user_metadata?.goal as string) ?? undefined}
        />
      </Suspense>
    </>
  );
}
