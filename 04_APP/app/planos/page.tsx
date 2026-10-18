import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import PlansGrid from "@/components/PlansGrid";
import Testimonials from "@/components/Testimonials";
import AudiobookPlayer from "@/components/AudiobookPlayer";
import { AUDIOBOOKS } from "@/lib/audiobooks";

export const dynamic = "force-static";

export const metadata = { title: "Planos — Mapas Falantes" };

// Botão do meio da página: desce até os planos.
function Cta() {
  return (
    <div className="mt-cta">
      <a href="#planos" className="primary-btn grad-btn">Ver os planos →</a>
      <span className="fine">🔒 Cancele quando quiser · 7 dias de garantia</span>
    </div>
  );
}

const COMPARE: [string, string, string, string][] = [
  ["Método completo: 120 mapas (A1–C2), plano de estudos e bônus", "✓", "✓", "✓"],
  ["Mapas novos com IA, sobre o assunto que você quiser", "15/mês", "30/mês", "50/mês"],
  ["🎧 Audiobooks novos com texto em inglês e português", "2/mês", "4/mês", "8/mês"],
  ["Suporte prioritário", "—", "✓", "✓"],
  ["📦 Aula pronta toda semana (audiobook + mapa + atividade)", "—", "—", "✓"],
  ["🔗 Link para a turma ouvir no celular, sem criar conta", "—", "—", "✓"],
  ["📝 Atividade em PDF com gabarito, a partir de qualquer mapa", "—", "—", "✓"],
  ["🏷️ Material com o seu nome para entregar aos alunos", "—", "—", "✓"],
];

// Página pública dos planos (para quem tem o Método e para quem ainda não tem): assinar vai direto ao checkout.
export default function PublicPlansPage() {
  const book = AUDIOBOOKS[0];
  return (
    <>
      <SiteNav minimal />
      <main>
        <section className="wrap" style={{ padding: "56px 0 8px", textAlign: "center" }}>
          <span className="eyebrow">PLANOS MAPAS FALANTES</span>
          <h1 style={{ maxWidth: 820, margin: "10px auto 0" }}>
            Inglês novo todo mês, <span className="grad-text">sobre o que você precisa.</span>
          </h1>
          <p className="lead" style={{ maxWidth: 700, margin: "16px auto 0" }}>
            O Método te dá o caminho do A1 ao C2. A assinatura mantém seus estudos vivos: mapas criados com IA
            sobre a sua viagem, o seu trabalho, a sua série, e audiobooks novos para treinar o ouvido.
          </p>
          <Cta />
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">✨ Mapas com IA</span>
            <h2 className="big-title">Digite o assunto. <span className="grad-text">Receba o mapa.</span></h2>
            <p className="mt-sub">Em segundos, um mapa organizado com as frases que você vai usar, áudio de nativo em cada uma, exercício e revisão.</p>
            <div className="mt-who">
              <div><span>✈️</span><h3>“Viagem para Orlando com crianças”</h3><p>Aeroporto, parques, restaurante, farmácia: as frases da sua viagem, prontas para treinar antes de embarcar.</p></div>
              <div><span>💼</span><h3>“Entrevista de emprego em TI”</h3><p>Perguntas comuns, como falar da sua experiência e o vocabulário da sua área.</p></div>
              <div><span>📺</span><h3>“Gírias de Friends”</h3><p>Aprenda com o que você gosta de assistir, explicado em português.</p></div>
            </div>
            <Cta />
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center", maxWidth: 820 }}>
            <span className="eyebrow">🎧 Audiobooks novos todo mês</span>
            <h2 className="big-title">Ouça uma história <span className="grad-text">e entenda tudo.</span></h2>
            <p className="mt-sub">
              Histórias curtas no seu nível, com áudio de nativo e o texto em inglês e português acompanhando a leitura.
              Aperte o play e ouça um dos audiobooks do app: “{book.title_pt}” ({book.level}).
            </p>
            <div style={{ textAlign: "left", marginTop: 24, maxHeight: 460, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
              <AudiobookPlayer audio={book.audio} duration={book.duration} sentences={book.sentences} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">✓ Em todos os planos</span>
            <h2 className="big-title">A base completa, <span className="grad-text">já incluída.</span></h2>
            <p className="mt-sub">Qualquer plano que você escolher já vem com o Método inteiro liberado.</p>
            <div className="mt-who">
              <div><span>🧭</span><h3>Teste de nível e plano de estudos</h3><p>Você descobre seu nível e recebe um caminho pelo seu objetivo, com o progresso acompanhado.</p></div>
              <div><span>📚</span><h3>120 mapas do A1 ao C2</h3><p>Mapas prontos e ilustrados, com áudio de nativo, exercício e quiz de revisão em cada um.</p></div>
              <div><span>🎁</span><h3>Bônus com áudio</h3><p>500 frases mais usadas, 100 verbos essenciais e 150 expressões e gírias.</p></div>
              <div><span>🗂️</span><h3>Histórico dos seus mapas</h3><p>Tudo o que você cria fica salvo na sua conta para revisar quando quiser.</p></div>
              <div><span>🖨️</span><h3>Baixe e imprima</h3><p>Salve os mapas em imagem para estudar no papel ou offline.</p></div>
              <div><span>📱</span><h3>No celular, tablet ou computador</h3><p>Coloque o app na tela inicial do celular e estude em qualquer lugar.</p></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <div className="pl-name">🌱 Plano Essencial<small>R$29,90/mês</small></div>
            <h2 className="big-title">Para estudar <span className="grad-text">no seu ritmo.</span></h2>
            <p className="mt-sub">Para quem estuda alguns dias por semana e quer conteúdo novo sem pressa.</p>
            <div className="mt-who">
              <div><span>✨</span><h3>15 mapas com IA por mês</h3><p>Um mapa novo a cada dois dias, sobre os assuntos que importam para você.</p></div>
              <div><span>🎧</span><h3>2 audiobooks novos por mês</h3><p>Histórias no seu nível para treinar o ouvido, com texto em inglês e português.</p></div>
              <div><span>📚</span><h3>Método completo</h3><p>Os 120 mapas, o plano de estudos e os bônus, tudo liberado.</p></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <div className="pl-name">🔥 Plano Fluente<small>R$49,90/mês · mais popular</small></div>
            <h2 className="big-title">Para quem quer <span className="grad-text">estudar todo dia.</span></h2>
            <p className="mt-sub">O dobro de conteúdo novo para manter o hábito diário e evoluir mais rápido.</p>
            <div className="mt-who">
              <div><span>✨</span><h3>30 mapas com IA por mês</h3><p>Um mapa novo por dia: prepare a reunião, a viagem, a entrevista, o que aparecer.</p></div>
              <div><span>🎧</span><h3>4 audiobooks por mês</h3><p>Uma história nova toda semana para treinar a escuta.</p></div>
              <div><span>💬</span><h3>Suporte prioritário</h3><p>Dúvidas sobre o app ou os estudos respondidas primeiro.</p></div>
            </div>
            <Cta />
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <div className="pl-name">👩‍🏫 Plano Professor<small>R$99,90/mês</small></div>
            <h2 className="big-title">Para quem ensina: <span className="grad-text">aula pronta toda semana.</span></h2>
            <p className="mt-sub">Menos tempo preparando material, mais tempo ensinando.</p>
            <div className="mt-who">
              <div><span>📦</span><h3>Aula pronta</h3><p>Toda semana: audiobook, mapa e atividade com gabarito, prontos para usar.</p></div>
              <div><span>🔗</span><h3>Link para a turma</h3><p>Seus alunos ouvem o audiobook e o mapa no celular, sem precisar criar conta.</p></div>
              <div><span>🏷️</span><h3>Com o seu nome</h3><p>Atividades em PDF com 1 clique e material com a sua marca para entregar.</p></div>
            </div>
          </div>
        </section>

        <section className="section" id="planos">
          <div className="wrap">
            <div style={{ textAlign: "center" }}>
              <span className="eyebrow">Escolha seu plano</span>
              <h2 className="big-title">Todos incluem <span className="grad-text">o Método completo.</span></h2>
              <p className="mt-sub">120 mapas do A1 ao C2, plano de estudos e bônus com áudio. Cancele quando quiser.</p>
            </div>
            <div style={{ marginTop: 28 }}><PlansGrid metodo direct /></div>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ maxWidth: 900 }}>
            <h2 className="big-title" style={{ textAlign: "center" }}>Compare os planos</h2>
            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table className="pl-compare">
                <thead><tr><th></th><th>Essencial</th><th>Fluente</th><th>Professor</th></tr></thead>
                <tbody>
                  {COMPARE.map(([f, a, b, c]) => (
                    <tr key={f}><td>{f}</td><td>{a}</td><td>{b}</td><td>{c}</td></tr>
                  ))}
                  <tr className="pl-price"><td>Preço</td><td>R$29,90/mês</td><td>R$49,90/mês</td><td>R$99,90/mês</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">Quem testou</span>
            <h2 className="big-title">O que estão <span className="grad-text">dizendo.</span></h2>
            <Testimonials />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="mt-guarantee">
              <span>🛡️</span>
              <div>
                <h3>Garantia incondicional de 7 dias</h3>
                <p>Assine, crie seus mapas, ouça os audiobooks. Se não for para você, peça o reembolso em até 7 dias e devolvemos 100% do valor.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section faq">
          <div className="wrap" style={{ maxWidth: 820 }}>
            <h2 className="big-title">Perguntas frequentes</h2>
            <details><summary>Já comprei o Método. Vou pagar por ele de novo?</summary><p>Não. O Método continua seu para sempre. A assinatura soma os mapas com IA e os audiobooks novos todo mês.</p></details>
            <details><summary>Ainda não tenho o Método. Preciso comprar antes?</summary><p>Não. Todos os planos já incluem o Método completo enquanto a assinatura estiver ativa.</p></details>
            <details><summary>Posso cancelar quando quiser?</summary><p>Sim. Sem multa e sem fidelidade. Você usa até o fim do período pago.</p></details>
            <details><summary>Posso trocar de plano depois?</summary><p>Sim. Fale com a gente e ajustamos para o plano que fizer mais sentido.</p></details>
            <details><summary>Como recebo o acesso?</summary><p>Logo após o pagamento, entre (ou crie sua conta) com o mesmo e-mail da compra. Tudo aparece liberado.</p></details>
            <details><summary>E se eu não gostar?</summary><p>Você tem 7 dias de garantia. Peça o reembolso dentro do prazo e devolvemos 100% do valor.</p></details>
          </div>
        </section>

        <section className="final-cta">
          <div className="wrap">
            <h2 className="big-title">Continue evoluindo. <span className="grad-text">Todo mês tem coisa nova.</span></h2>
            <Cta />
          </div>
        </section>
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Mapas Falantes · <Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos de Uso</Link></footer>
    </>
  );
}
