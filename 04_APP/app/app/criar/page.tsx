import { Suspense } from "react";
import Generator from "@/components/Generator";
import { getCurrentUser, getProfile } from "@/lib/supa/server";

export const dynamic = "force-dynamic";

// Página só para criar mapas (o quiz também cai aqui para gerar o 1º mapa).
export default async function CreatePage() {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const credits = profile?.credits ?? 0;
  return (
    <>
      <div className="app-top">
        <span className="credit-pill"><b>{credits}</b> {credits === 1 ? "mapa restante" : "mapas restantes"}</span>
      </div>
      <h1 className="app-hello">Criar <span className="grad-text">novo mapa</span></h1>
      <p className="app-sub">
        Digite um assunto (ex.: &quot;pedir comida no restaurante&quot;, &quot;phrasal verbs de trabalho&quot;,
        a letra de uma música) e escolha seu nível.
      </p>
      <Suspense>
        <Generator
          credits={credits}
          autoFocus
          defaultLevel={(user.user_metadata?.level as string) ?? "A1"}
          defaultGoal={(user.user_metadata?.goal as string) ?? undefined}
        />
      </Suspense>
    </>
  );
}
