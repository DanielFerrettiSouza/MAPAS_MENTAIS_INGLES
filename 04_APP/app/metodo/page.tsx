import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import MetodoSections from "@/components/MetodoSections";

export const dynamic = "force-static";

export const metadata = { title: "Método Mapas Falantes — estude inglês do A1 ao C2" };

// Página dos anúncios do método: vende o Método vitalício direto no checkout, com "testar grátis" secundário.
export default function MetodoPage() {
  return (
    <>
      <SiteNav buy />
      <main>
        <section className="wrap hero">
          <div>
            <span className="eyebrow">MÉTODO MAPAS FALANTES · DO A1 AO C2</span>
            <h1>
              Um método completo para aprender inglês <span className="grad-text">ouvindo e praticando.</span>
            </h1>
            <p className="lead">
              Saiba o que estudar em cada etapa, acompanhe seu progresso e pratique com mapas ilustrados,
              áudio de pronúncia nativa e exercícios. Com o acesso vitalício, você tem um caminho organizado para estudar com direção e constância.
            </p>
            <ul className="metodo-list">
              <li>🧭 Teste de nível, plano de estudos e acompanhamento do progresso</li>
              <li>📚 120 mapas prontos do A1 ao C2, com áudio nativo e exercícios</li>
              <li>🎁 Bônus: 500 frases, 100 verbos e 150 expressões e gírias com áudio</li>
              <li>✨ 3 criações de mapas por IA incluídas para personalizar seus estudos</li>
            </ul>
            <div className="cta-row">
              <a href="#oferta" className="primary-btn grad-btn">Quero o Método →</a>
              <span className="fine">Pagamento único · acesso vitalício · 7 dias de garantia</span>
            </div>
            <p className="fine" style={{ marginTop: 14, maxWidth: 560, lineHeight: 1.5 }}>
              As 3 criações por IA estão incluídas na compra. Para criar mapas adicionais com IA depois,
              será necessário assinar um plano.
            </p>
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
