import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import HeroMaps from "@/components/HeroMaps";
import MetodoSections from "@/components/MetodoSections";
import { EXTRAS } from "@/lib/plans";
import BuyButton from "@/components/BuyButton";

export const revalidate = 3600;

export const metadata = { title: "Método Mapas Falantes — inglês sem se perder" };

// Página dos anúncios do método: vende o Método vitalício direto no checkout, com "testar grátis" secundário.
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
              120 mapas do A1 ao C2 com áudio de nativo em cada frase. Pague uma vez, acesse para sempre.
            </p>
            <ul className="metodo-list">
              <li>🧭 Teste de nível + plano de estudos</li>
              <li>📚 120 mapas prontos do A1 ao C2, com áudio e exercício</li>
              <li>🎁 4 bônus: 500 frases, 100 verbos, 150 gírias e 3 mapas com IA</li>
            </ul>
            <div className="cta-row">
              <BuyButton label={`Quero o Método por ${EXTRAS.biblioteca.price} →`} />
              <span className="fine">Pagamento único · acesso vitalício · 7 dias de garantia</span>
            </div>
            <p style={{ marginTop: 10 }}>
              <Link href="/quiz" style={{ color: "var(--muted)" }}>Prefere testar antes? Crie 3 mapas grátis →</Link>
            </p>
          </div>
          <div className="hero-visual">
            <HeroMaps />
          </div>
        </section>

        <MetodoSections />
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Mapas Falantes · <Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos de Uso</Link></footer>
    </>
  );
}
