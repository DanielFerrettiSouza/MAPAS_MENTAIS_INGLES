import SiteNav from "@/components/SiteNav";
import PlansGrid from "@/components/PlansGrid";
import Guarantee from "@/components/Guarantee";

export const dynamic = "force-static";

export const metadata = { title: "Planos — Mapas Falantes" };

// Página pública dos planos (para mandar o link a quem ainda não tem conta): assinar vai direto ao checkout.
export default function PublicPlansPage() {
  return (
    <>
      <SiteNav minimal />
      <main className="wrap" style={{ padding: "48px 0" }}>
        <h1 style={{ textAlign: "center" }}>Escolha seu <span className="grad-text">plano</span></h1>
        <p className="lead" style={{ textAlign: "center", maxWidth: 680, margin: "12px auto 32px" }}>
          Todos os planos incluem o Método completo: 120 mapas do A1 ao C2, plano de estudos e bônus com áudio.
          Cancele quando quiser. 7 dias de garantia.
        </p>
        <PlansGrid metodo direct />
        <Guarantee />
      </main>
    </>
  );
}
