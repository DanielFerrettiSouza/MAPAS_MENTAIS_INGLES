import Link from "next/link";
import BuyButton from "./BuyButton";
import MindMapView from "./MindMapView";
import LevelExplorer from "./LevelExplorer";
import { BONUS } from "@/lib/bonus";
import { EXTRAS } from "@/lib/plans";
import { SAMPLE_MAP_SLUG } from "@/lib/library";
import { createSupabaseAdmin } from "@/lib/supa/server";
import type { MapWithImages } from "@/lib/mapSchema";

const PRICE = EXTRAS.biblioteca.price;
const CTA = `Quero o Método por ${PRICE} →`;


const BONUS_CARDS = [
  { n: 1, key: "frases", ico: "💬", title: "500 frases mais usadas", text: "Organizadas por situação: viagem, trabalho, restaurante, conversa. Toque e ouça cada uma." },
  { n: 2, key: "verbos", ico: "⚡", title: "100 verbos essenciais", text: "Os verbos que aparecem em toda conversa, com frase de exemplo e áudio." },
  { n: 3, key: "expressoes", ico: "😎", title: "150 expressões e gírias", text: "Como os americanos falam de verdade nas séries e na rua, explicado em português." },
] as const;

const STACK = [
  "🧭 Teste de nível + plano de estudos pelo seu objetivo",
  "📚 120 mapas mentais prontos, do A1 ao C2",
  "🔊 Áudio de nativo em todas as frases",
  "✏️ Exercício e quiz de revisão em cada mapa",
  "🎁 Bônus #1 · 500 frases mais usadas com áudio",
  "🎁 Bônus #2 · 100 verbos essenciais com áudio",
  "🎁 Bônus #3 · 150 expressões e gírias com áudio",
  "✨ Bônus #4 · 3 mapas sob medida com IA, sobre o assunto que você quiser",
];

function Cta({ big }: { big?: boolean }) {
  return (
    <div className="mt-cta">
      <BuyButton label={CTA} style={big ? { fontSize: 19, padding: "18px 34px" } : undefined} />
      <span className="fine">🔒 Pagamento único · acesso vitalício · 7 dias de garantia</span>
    </div>
  );
}

export default async function MetodoSections() {
  const { data } = await createSupabaseAdmin().from("library_maps").select("data").eq("slug", SAMPLE_MAP_SLUG).maybeSingle();
  const sample = data?.data as MapWithImages | undefined;

  return (
    <>
      {sample && (
        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">O material por dentro</span>
            <h2 className="big-title">Veja um mapa <span className="grad-text">de verdade.</span></h2>
            <p className="mt-sub">Este é o mapa “No aeroporto”, do nível A2. Toque em qualquer frase para ouvir o áudio.</p>
            <div className="mt-sample"><MindMapView map={sample} /></div>
            <Cta />
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">Organização do método</span>
          <h2 className="big-title">120 mapas, do zero ao <span className="grad-text">avançado.</span></h2>
          <p className="mt-sub">Divididos pelos níveis oficiais (A1 a C2). Você começa no seu nível e sobe no seu ritmo.</p>
          <LevelExplorer />
          <Cta />
        </div>
      </section>

      <section className="section mt-bonus">
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">Bônus inclusos</span>
          <h2 className="big-title">Você também leva <span className="grad-text">4 bônus.</span></h2>
          <p className="mt-sub">Tudo com áudio de nativo e liberado junto com o método, no mesmo acesso.</p>
          <div className="mt-bonus-grid">
            {BONUS_CARDS.map((b) => {
              const items = BONUS[b.key].sections[0].items.slice(0, 3);
              return (
                <div key={b.key} className="mt-bonus-card">
                  <span className="mt-bonus-tag">BÔNUS #{b.n}</span>
                  <div className="mt-bonus-ico">{b.ico}</div>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                  <ul>
                    {items.map((i) => <li key={i.en}><b>{i.en}</b> <span>= {i.pt}</span></li>)}
                  </ul>
                  <span className="mt-incl">✓ INCLUSO</span>
                </div>
              );
            })}
            <div className="mt-bonus-card">
              <span className="mt-bonus-tag">BÔNUS #4</span>
              <div className="mt-bonus-ico">✨</div>
              <h3>3 mapas sob medida com IA</h3>
              <p>Sua viagem, sua entrevista, sua série favorita: digite o assunto e receba um mapa ilustrado, com áudio, em segundos.</p>
              <ul>
                <li><b>“Entrevista de emprego em TI”</b></li>
                <li><b>“Viagem para Orlando com crianças”</b></li>
                <li><b>“Gírias de Friends”</b></li>
              </ul>
              <span className="mt-incl">✓ INCLUSO</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">Para quem é</span>
          <h2 className="big-title">Feito para quem quer <span className="grad-text">falar.</span></h2>
          <div className="mt-who">
            <div><span>🌱</span><h3>Está começando do zero</h3><p>Um caminho pronto, do A1 em diante, com tradução em tudo. Sem decorar regra.</p></div>
            <div><span>⏰</span><h3>Tem pouco tempo</h3><p>Um mapa leva 5 minutos. Dá para estudar no ônibus, na fila, no intervalo.</p></div>
            <div><span>🗣️</span><h3>Trava na hora de falar</h3><p>Você ouve cada frase, repete em voz alta e treina a pronúncia certa.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="oferta">
        <div className="wrap">
          <div className="mt-offer">
            <span className="eyebrow">Tudo o que você recebe</span>
            <ul>{STACK.map((s) => <li key={s}>{s}</li>)}</ul>
            <div className="mt-price">
              <small>Pagamento único</small>
              <strong>{PRICE}</strong>
              <span>sem mensalidade · acesso vitalício</span>
            </div>
            <BuyButton label={CTA} style={{ width: "100%", textAlign: "center", display: "block", fontSize: 19, padding: "18px 20px" }} />
            <p className="guarantee-note">🔒 Compra segura pela Kiwify · PIX ou cartão</p>
          </div>
          <div className="mt-guarantee">
            <span>🛡️</span>
            <div>
              <h3>Garantia incondicional de 7 dias</h3>
              <p>Entre, estude, ouça os mapas. Se não for para você, peça o reembolso em até 7 dias e devolvemos 100% do valor. Sem perguntas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">Entrega imediata</span>
          <h2 className="big-title">Como você recebe</h2>
          <div className="mt-who">
            <div><span>1</span><h3>Pagamento aprovado</h3><p>PIX cai na hora. Cartão leva poucos segundos.</p></div>
            <div><span>2</span><h3>Crie sua conta</h3><p>Use o mesmo e-mail da compra. Tudo aparece liberado.</p></div>
            <div><span>3</span><h3>Estude onde quiser</h3><p>Celular, tablet ou computador. Baixe os mapas em imagem para imprimir.</p></div>
          </div>
        </div>
      </section>

      <section className="section faq">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <h2 className="big-title">Perguntas frequentes</h2>
          <details><summary>É assinatura? Tem mensalidade?</summary><p>Não. Você paga uma vez e tem acesso para sempre ao método, aos mapas e aos bônus.</p></details>
          <details><summary>Preciso saber inglês para começar?</summary><p>Não. O método começa no A1 e todo mapa tem tradução em português.</p></details>
          <details><summary>O áudio é de verdade?</summary><p>Sim. Cada frase tem um botão que toca a pronúncia de um nativo americano.</p></details>
          <details><summary>Posso estudar pelo celular?</summary><p>Sim. Funciona no celular, tablet e computador, e você pode baixar os mapas em imagem para imprimir.</p></details>
          <details><summary>Como recebo o acesso?</summary><p>Logo após o pagamento, crie sua conta com o mesmo e-mail da compra. Tudo já aparece liberado.</p></details>
          <details><summary>Os bônus estão incluídos?</summary><p>Sim. Os 4 bônus são liberados junto com o método, sem pagar nada a mais.</p></details>
          <details><summary>E se eu não gostar?</summary><p>Você tem 7 dias de garantia. Peça o reembolso dentro do prazo e devolvemos 100% do valor.</p></details>
          <details><summary>Substitui um curso de inglês?</summary><p>É um método de estudo e revisão para usar todo dia. Não promete fluência mágica: funciona para quem pratica um pouco por dia.</p></details>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <h2 className="big-title">Comece hoje. <span className="grad-text">5 minutos por dia.</span></h2>
          <ul className="mt-final-list">{STACK.map((s) => <li key={s}>{s}</li>)}</ul>
          <Cta big />
          <p style={{ marginTop: 14 }}><Link href="/quiz" style={{ color: "var(--muted)" }}>ou teste grátis com 3 mapas</Link></p>
        </div>
      </section>
    </>
  );
}
