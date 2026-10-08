import PlansGrid from "@/components/PlansGrid";
import { getCurrentUser, getProfile } from "@/lib/supa/server";

export default async function PlansPage({ searchParams }: { searchParams: { plano?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  return (
    <>
      <h1 className="app-hello">Escolha seu plano</h1>
      <p className="app-sub">Mais mapas, mais áudio, mais revisão. Cancele quando quiser.</p>
      {searchParams.plano && (
        <div className="gen-box" style={{ marginBottom: 20 }}>
          💳 O pagamento online está chegando. Enquanto isso, fale com a gente para ativar o plano escolhido.
        </div>
      )}
      <PlansGrid ctaHref="/app/planos" currentPlan={profile?.plan ?? "free"} />
    </>
  );
}
