import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import HeroMaps from "@/components/HeroMaps";
import SalesSections from "@/components/SalesSections";
import BuyButton from "@/components/BuyButton";

export const metadata = { title: "Método Mapas Falantes — inglês sem se perder" };

// Página dos anúncios do método: vende o Plano Fluente direto (checkout), com "testar grátis" secundário.
export default function MetodoPage() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="wrap hero">
          <div>
            <span className="eyebrow">Método Mapas Falantes</span>
            <h1>
              Aprenda inglês <span className="grad-text">sem se perder.</span> 5 minutos por dia.
            </h1>
            <p className="lead">
              Descubra seu nível, siga um plano de estudos pronto e aprenda com mapas mentais que falam:
              120 mapas do A1 ao C2, áudio de nativo em cada frase e mapas novos de qualquer assunto com IA.
            </p>
            <ul className="metodo-list">
              <li>🧭 Teste de nível + plano de estudos</li>
              <li>📚 120 mapas prontos + 60 novos por mês com IA</li>
              <li>🎁 Bônus: 500 frases, 100 verbos e 150 gírias com áudio</li>
            </ul>
            <div className="cta-row">
              <BuyButton label="Quero o Método →" />
              <span className="fine">R$49,90/mês · 7 dias de garantia · cancele quando quiser</span>
            </div>
            <p style={{ marginTop: 10 }}>
              <Link href="/quiz" style={{ color: "var(--muted)" }}>Prefere testar antes? Crie 3 mapas grátis →</Link>
            </p>
          </div>
          <div className="hero-visual">
            <HeroMaps />
          </div>
        </section>

        <SalesSections buy />
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Mapas Falantes · <Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos de Uso</Link></footer>
    </>
  );
}
