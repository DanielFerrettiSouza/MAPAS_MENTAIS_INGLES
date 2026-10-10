import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import HeroMaps from "@/components/HeroMaps";
import SalesSections from "@/components/SalesSections";

export default function Landing() {
  return (
    <>
      <SiteNav />
      <main>
        <section className="wrap hero">
          <div>
            <span className="eyebrow">Mapa mental + áudio nativo + IA</span>
            <h1>
              Aprenda inglês com mapas que <span className="grad-text">falam.</span>
            </h1>
            <p className="lead">
              Digite qualquer assunto e receba, em segundos, um mapa mental ilustrado com a
              pronúncia nativa de cada frase. Chega de PDF que explica a regra mas não te
              ensina como ela soa.
            </p>
            <div className="cta-row">
              <Link href="/quiz" className="primary-btn grad-btn">Criar meu primeiro mapa →</Link>
              <span className="fine">3 mapas grátis. Sem cartão. Sem enrolação.</span>
            </div>
          </div>
          <div className="hero-visual">
            <HeroMaps />
          </div>
        </section>

        <SalesSections />
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Mapas Falantes · <Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos de Uso</Link></footer>
    </>
  );
}
