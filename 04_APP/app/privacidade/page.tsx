import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Política de Privacidade · Mapas Falantes" };

export default function Privacidade() {
  return (
    <LegalPage title="Política de Privacidade">
      <h2>1. Quem somos</h2>
      <p>O Mapas Falantes é um aplicativo que cria mapas mentais de inglês com áudio usando inteligência artificial. Contato: suporte pelo e-mail informado na página de planos.</p>
      <h2>2. Dados que coletamos</h2>
      <ul>
        <li><b>Conta:</b> e-mail e nome (ou os dados básicos do seu perfil Google, se você entrar com Google).</li>
        <li><b>Uso:</b> os assuntos que você pesquisa, os mapas gerados e as respostas do quiz de entrada.</li>
        <li><b>Pagamento:</b> processado pela Kiwify. Não armazenamos dados de cartão; recebemos apenas a confirmação da compra e o e-mail do comprador.</li>
      </ul>
      <h2>3. Para que usamos</h2>
      <ul>
        <li>Criar e guardar seus mapas, controlar seu plano e seus créditos.</li>
        <li>Personalizar o conteúdo para seu nível e objetivo.</li>
        <li>Enviar comunicações sobre sua conta e, se você permitir, novidades do produto.</li>
      </ul>
      <h2>4. Com quem compartilhamos</h2>
      <p>Usamos fornecedores para operar o serviço: Supabase (banco de dados e login), Vercel (hospedagem), Anthropic e Google Gemini (geração de conteúdo e ilustrações), ElevenLabs (áudio) e Kiwify (pagamentos). Eles recebem apenas o necessário para prestar o serviço. Não vendemos seus dados.</p>
      <h2>5. Seus direitos (LGPD)</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados e da sua conta a qualquer momento pelo nosso e-mail de suporte.</p>
      <h2>6. Segurança e retenção</h2>
      <p>Os dados ficam em servidores com criptografia e acesso restrito. Mantemos seus mapas enquanto sua conta existir; ao excluir a conta, os dados são apagados.</p>
    </LegalPage>
  );
}
