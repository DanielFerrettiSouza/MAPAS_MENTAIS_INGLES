import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Termos de Uso · Mapas Falantes" };

export default function Termos() {
  return (
    <LegalPage title="Termos de Uso">
      <h2>1. O serviço</h2>
      <p>O Mapas Falantes gera mapas mentais de inglês com áudio por inteligência artificial. O conteúdo é gerado automaticamente e pode conter imprecisões; use-o como material de estudo.</p>
      <h2>2. Conta</h2>
      <p>Você é responsável pelos dados informados e pela segurança do seu acesso. Cada conta é pessoal.</p>
      <h2>3. Planos e pagamentos</h2>
      <ul>
        <li>A conta gratuita inclui 3 mapas. Os planos pagos são assinaturas mensais com uma quantidade de mapas por mês.</li>
        <li>Os pagamentos são processados pela Kiwify. A assinatura renova automaticamente até ser cancelada.</li>
        <li>Você pode cancelar a qualquer momento; o acesso continua até o fim do período pago. Garantia de 7 dias conforme o Código de Defesa do Consumidor.</li>
      </ul>
      <h2>4. Uso permitido</h2>
      <p>Não é permitido usar o serviço para gerar conteúdo ilegal, ofensivo ou para tentar burlar os limites do plano. Os mapas podem ser usados nos seus estudos; no plano Professor, também com seus alunos.</p>
      <h2>5. Alterações</h2>
      <p>Podemos atualizar estes termos e avisaremos sobre mudanças relevantes.</p>
    </LegalPage>
  );
}
