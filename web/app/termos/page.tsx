import { LegalPage } from '@/components/legal-page';

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Condições de uso" title="Termos de uso" intro="Ao criar uma conta ou agendar um horário, você concorda com estas condições básicas para uso da plataforma Gante.">
      <h2>Conta</h2>
      <p>Você deve fornecer informações verdadeiras e proteger o acesso à sua conta. O login pode ser realizado por e-mail e senha ou por uma conta Google vinculada ao Firebase Authentication.</p>
      <h2>Agendamentos</h2>
      <p>A reserva é confirmada quando aparece no painel do cliente. Horários dependem da disponibilidade indicada no sistema. Em caso de imprevisto, use o botão de cancelamento para liberar o horário.</p>
      <h2>Serviços e valores</h2>
      <p>Preços, duração e profissionais são exibidos antes da confirmação. A administração pode atualizar o catálogo para refletir disponibilidade e condições da unidade.</p>
      <h2 id="planos">Planos e benefícios</h2>
      <p>As telas de planos e Clube Gante apresentam opções e benefícios informativos. Uma contratação financeira só será concluída quando houver confirmação expressa das condições comerciais e do meio de pagamento; navegar ou agendar não gera cobrança de plano.</p>
      <h2>Uso adequado</h2>
      <p>Não é permitido tentar acessar contas de terceiros, interferir no funcionamento do serviço ou usar a plataforma para finalidades ilegais.</p>
      <h2>Alterações</h2>
      <p>Estes termos podem ser atualizados quando o serviço mudar. A versão vigente e sua data ficam disponíveis nesta página.</p>
      <p><small>Última atualização: 2 de setembro de 2026. Este texto deve ser validado com os dados jurídicos da empresa antes de uma abertura pública.</small></p>
    </LegalPage>
  );
}
