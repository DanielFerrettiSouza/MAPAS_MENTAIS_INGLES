import PlansGrid from "@/components/PlansGrid";
import Guarantee from "@/components/Guarantee";
import SalesSections from "@/components/SalesSections";
import HeroMaps from "@/components/HeroMaps";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { checkoutUrl } from "@/lib/plans";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PlansPage({ searchParams }: { searchParams: { plano?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  // Veio da landing já com um plano escolhido: vai direto ao checkout.
  const direct = searchParams.plano && checkoutUrl(searchParams.plano, user.email);
  if (direct) redirect(direct);

  const plan = profile?.plan ?? "free";
  // Assinante: só troca de plano.
  if (plan !== "free") {
    return (
      <>
        <h1 className="app-hello">Escolha seu plano</h1>
        <p className="app-sub">Mais mapas, mais áudio, mais revisão. Cancele quando quiser. 7 dias de garantia.</p>
        <PlansGrid ctaHref="/app/planos" currentPlan={plan} email={user.email} />
        <Guarantee />
      </>
    );
  }

  // Grátis: a página de vendas completa, dentro do app.
  const outOfCredits = (profile?.credits ?? 0) <= 0;
  return (
    <div className="in-app-sales">
      <section className="wrap hero">
        <div>
          <span className="eyebrow">{outOfCredits ? "Seus 3 mapas grátis acabaram" : "Mapa mental + áudio nativo + IA"}</span>
          <h1>
            {outOfCredits ? <>Gostou? Agora é só <span className="grad-text">continuar.</span></> : <>Aprenda inglês com mapas que <span className="grad-text">falam.</span></>}
          </h1>
          <p className="lead">
            Você já viu como funciona: qualquer assunto vira um mapa ilustrado, com a pronúncia
            nativa de cada frase. Assine para criar mapas novos todos os dias, revisar e destravar
            seu inglês de verdade.
          </p>
          <div className="cta-row">
            <a href="#planos" className="primary-btn grad-btn">Ver planos →</a>
            <span className="fine">🛡️ 7 dias de garantia. Cancele quando quiser.</span>
          </div>
        </div>
        <div className="hero-visual">
          <HeroMaps />
        </div>
      </section>
      <SalesSections inApp email={user.email} currentPlan={plan} />
    </div>
  );
}
