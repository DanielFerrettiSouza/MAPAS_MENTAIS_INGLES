import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import MetodoSections from "@/components/MetodoSections";
import { EXTRAS } from "@/lib/plans";

export const dynamic = "force-static";

export const metadata = { title: "Mapas Falantes — 120 mapas mentais de inglês que falam" };

// Página dos anúncios do método: vende o Método vitalício direto no checkout, com "testar grátis" secundário.
export default function MetodoPage() {
  return (
    <>
      <SiteNav buy />
      <main>
        <section className="wrap hero">
          <div>
            <span className="eyebrow">Método Mapas Falantes · do A1 ao C2</span>
            <h1>
              120 mapas mentais de inglês <span className="grad-text">que falam.</span>
            </h1>
            <p className="lead">
              Cada frase do mapa tem áudio de nativo: você vê, toca, ouve e repete. Organizados do básico
              ao avançado, com exercício que corrige na hora e um plano que diz o que estudar. Pague uma vez,
              acesse para sempre.
            </p>
            <ul className="metodo-list">
              <li>🧭 Teste de nível + plano de estudos</li>
              <li>📚 120 mapas prontos do A1 ao C2, com áudio e exercício</li>
              <li>🎁 4 bônus: 500 frases, 100 verbos, 150 gírias e 3 mapas com IA</li>
            </ul>
            <div className="cta-row">
              <a href="#oferta" className="primary-btn grad-btn">{`Quero o Método por ${EXTRAS.biblioteca.price} →`}</a>
              <span className="fine">{EXTRAS.biblioteca.installments} ou {EXTRAS.biblioteca.price} à vista · acesso vitalício · 7 dias de garantia</span>
            </div>
          </div>
          <div className="hero-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/metodo/hero-mapas.jpg" alt="Mapas mentais de inglês: Pedindo comida, No aeroporto e Presente Perfeito" width={900} height={840} decoding="async" style={{ display: "block", width: "100%", height: "auto" }} />
          </div>
        </section>

        <MetodoSections />
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Mapas Falantes · <Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos de Uso</Link></footer>
    </>
  );
}
