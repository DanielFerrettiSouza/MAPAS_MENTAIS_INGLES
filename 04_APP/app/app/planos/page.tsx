import PlansGrid from "@/components/PlansGrid";
import Guarantee from "@/components/Guarantee";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { checkoutUrl } from "@/lib/plans";
import { redirect } from "next/navigation";

export default async function PlansPage({ searchParams }: { searchParams: { plano?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  // Veio da landing já com um plano escolhido: vai direto ao checkout.
  const direct = searchParams.plano && checkoutUrl(searchParams.plano, user.email);
  if (direct) redirect(direct);
  return (
    <>
      <h1 className="app-hello">Escolha seu plano</h1>
      <p className="app-sub">Mais mapas, mais áudio, mais revisão. Cancele quando quiser. 7 dias de garantia.</p>
      <PlansGrid ctaHref="/app/planos" currentPlan={profile?.plan ?? "free"} email={user.email} />
      <Guarantee />
    </>
  );
}
