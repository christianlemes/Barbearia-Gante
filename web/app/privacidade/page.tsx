import { LegalPage } from '@/components/legal-page';

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Transparência" title="Política de privacidade" intro="Esta política explica, em linguagem direta, como a Gante usa os dados necessários para manter sua conta e prestar os serviços de agendamento.">
      <h2>Dados que utilizamos</h2>
      <p>Podemos tratar nome, e-mail, telefone, dados opcionais do perfil, preferências e informações dos agendamentos. Quando você entra com o Google, recebemos do Firebase Authentication os dados básicos autorizados por você, como nome, e-mail e foto.</p>
      <h2>Por que usamos esses dados</h2>
      <p>Os dados são usados para autenticar sua conta, confirmar e administrar horários, manter seu histórico, evitar reservas duplicadas, personalizar o atendimento e registrar suas preferências de contato.</p>
      <h2>Armazenamento e fornecedores</h2>
      <p>A autenticação e o banco de dados utilizam serviços do Google Firebase. O acesso administrativo é restrito e as regras do banco limitam cada cliente aos próprios dados e agendamentos.</p>
      <h2>Seus direitos</h2>
      <p>Você pode consultar e corrigir informações diretamente no perfil. Também pode pedir confirmação do tratamento, acesso, correção ou exclusão quando aplicável. A <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares" target="_blank" rel="noreferrer">ANPD explica os direitos dos titulares</a> previstos na LGPD.</p>
      <h2>Contato</h2>
      <p>Solicitações sobre dados pessoais podem ser apresentadas no atendimento da unidade Parque Santos Dumont, Rua Senador Filinto Müller, 145, São José dos Campos.</p>
      <p><small>Última atualização: 2 de setembro de 2026. Este texto deve ser revisado com os dados jurídicos e canais oficiais da empresa antes de uma abertura pública.</small></p>
    </LegalPage>
  );
}
