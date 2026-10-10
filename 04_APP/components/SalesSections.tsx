import Link from "next/link";
import PlansGrid from "@/components/PlansGrid";
import MapWall from "@/components/MapWall";
import Guarantee from "@/components/Guarantee";

// Corpo da página de vendas: usado na landing e, dentro do app, na oferta
// que aparece quando os mapas grátis acabam (inApp).
const STEPS = [
  { ico: "🎯", title: "Responda o quiz de 1 minuto", text: "Seu nível, seu objetivo (viagem, trabalho, séries, prova) e quanto tempo você tem. A partir disso, o Mapas Falantes monta seu plano." },
  { ico: "✍️", title: "Digite qualquer assunto", text: "\"Pedir comida no restaurante\", \"entrevista de emprego\", \"phrasal verbs\", a letra de uma música... Se você quer aprender, vira mapa." },
  { ico: "🗺️", title: "A IA monta o mapa ilustrado", text: "Em segundos: seções organizadas, ilustrações, dica de gramática e o erro que todo brasileiro comete — com a correção." },
  { ico: "🔊", title: "Toque e ouça cada frase", text: "Todo item do mapa tem pronúncia nativa americana. Você vê, escuta e repete sem trocar de aba nem procurar no Google." },
  { ico: "✏️", title: "Revise e fixe", text: "Mini exercício de completar e quiz de revisão em cada mapa. É o que transforma \"eu li\" em \"eu sei falar\"." },
];

export default function SalesSections({
  inApp = false,
  email,
  currentPlan,
}: {
  inApp?: boolean;
  email?: string | null;
  currentPlan?: string;
}) {
  return (
    <>
    <section className="section">
      <div className="wrap stats">
        <div><strong>~30 s</strong><span>para criar um mapa</span></div>
        <div><strong>A1 → C2</strong><span>do básico ao avançado</span></div>
        <div><strong>100%</strong><span>das frases com áudio</span></div>
        <div><strong>∞</strong><span>assuntos possíveis</span></div>
      </div>
    </section>

    <section className="section" style={{ paddingBottom: 40 }}>
      <div className="wrap" style={{ textAlign: "center" }}>
        <p style={{ letterSpacing: 3, color: "var(--muted)", fontWeight: 600, margin: 0 }}>QUALQUER ASSUNTO VIRA MAPA</p>
      </div>
      <MapWall />
    </section>

    <section className="section problem">
      <div className="wrap">
        <h2 className="big-title">
          O problema não é a gramática.<br />
          <span className="grad-text">O problema é que você nunca ouviu.</span>
        </h2>
        <p>
          Você baixa um PDF de mapas mentais. Lê a regra. Entende. Fecha. No dia seguinte
          precisa falar e trava — porque nunca ouviu como aquilo soa de verdade.
        </p>
        <p>
          Aí abre o Google Tradutor, procura a pronúncia em outro site, perde 10 minutos
          e a vontade de estudar junto. <b>O problema nunca foi falta de esforço. É que o
          material separa o que você vê do que você escuta.</b>
        </p>
      </div>
    </section>

    <section className="section">
      <div className="wrap">
        <h2 className="big-title" style={{ textAlign: "center" }}>Do zero ao mapa estudado em 5 passos.</h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 18 }}>Sem PDF. Sem Google Tradutor. Sem desculpa.</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="step">
              <div className="step-num">Passo {i + 1}</div>
              <div>
                <h3><span className="ico">{s.ico}</span>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="wrap">
        <h2 className="big-title" style={{ textAlign: "center" }}>PDF de mapas vs. Mapas Falantes</h2>
        <div className="compare">
          <div>
            <h4 style={{ color: "#f87171" }}>PDF COMUM</h4>
            <ul>
              <li>✕ Mapas fixos — nada sobre o que você precisa agora</li>
              <li>✕ Áudio separado (quando tem)</li>
              <li>✕ Você procura a pronúncia em outro site</li>
              <li>✕ Sem exercício, sem revisão</li>
              <li>✕ Leu, fechou, esqueceu</li>
            </ul>
          </div>
          <div className="with">
            <h4 style={{ color: "#4ade80" }}>MAPAS FALANTES</h4>
            <ul>
              <li>✓ Um mapa novo para qualquer assunto, na hora</li>
              <li>✓ Áudio nativo dentro de cada frase do mapa</li>
              <li>✓ Ilustrado e organizado como apostila</li>
              <li>✓ Erro comum, dica e mini exercício em cada mapa</li>
              <li>✓ Seus mapas salvos para revisar quando quiser</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section className="section" id="planos">
      <div className="wrap">
        <h2 className="big-title" style={{ textAlign: "center" }}>Escolha seu plano</h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 18 }}>
          {inApp ? "Continue de onde parou. Cancele quando quiser." : "Comece grátis. Assine quando quiser mais mapas."}
        </p>
        <PlansGrid ctaHref={inApp ? "/app/planos" : undefined} email={email} currentPlan={currentPlan} />
        <Guarantee />
      </div>
    </section>

    <section className="section faq">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h2 className="big-title">Perguntas frequentes</h2>
        <details><summary>O áudio é de verdade?</summary><p>Sim. Cada palavra e frase do mapa tem um botão que toca a pronúncia nativa (sotaque americano), gerada na hora.</p></details>
        <details><summary>Preciso saber inglês para usar?</summary><p>Não. Você escolhe o nível (do A1, iniciante, ao C2) e todo mapa vem com tradução em português.</p></details>
        <details><summary>Posso imprimir os mapas?</summary><p>Sim. Cada mapa pode ser baixado em imagem de alta resolução.</p></details>
        <details><summary>Como funciona o teste grátis?</summary><p>Você cria sua conta e ganha 3 mapas para usar como quiser. Sem cartão de crédito.</p></details>
        <details><summary>E se eu não gostar depois de assinar?</summary><p>Você tem 7 dias de garantia. Se não gostar, peça o reembolso em até 7 dias após a compra e devolvemos 100% do valor.</p></details>
        <details><summary>Posso cancelar quando quiser?</summary><p>Sim. A assinatura é mensal e pode ser cancelada a qualquer momento.</p></details>
      </div>
    </section>

    <section className="final-cta">
      <div className="wrap">
        {inApp ? (
          <>
            <h2 className="big-title">Seu próximo mapa leva <span className="grad-text">30 segundos.</span></h2>
            <a href="#planos" className="primary-btn grad-btn" style={{ fontSize: 18, padding: "18px 30px", marginTop: 18 }}>
              Escolher meu plano →
            </a>
          </>
        ) : (
          <>
            <h2 className="big-title">Seu primeiro mapa leva <span className="grad-text">30 segundos.</span></h2>
            <Link href="/quiz" className="primary-btn grad-btn" style={{ fontSize: 18, padding: "18px 30px", marginTop: 18 }}>
              Criar meu primeiro mapa →
            </Link>
          </>
        )}
      </div>
    </section>
    </>
  );
}
