'use client';

import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';

export default function PrivacyPolicyPage() {
  return (
    <PageContainer title="Política de Privacidade" subtitle="Última atualização: 15 de maio de 2025">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">1. Introdução</h2>
          <p className="text-zinc-200 leading-relaxed">
            A OFinanceAI valoriza a privacidade de seus usuários. Esta Política de Privacidade 
            explica como coletamos, usamos, compartilhamos e protegemos suas informações pessoais 
            quando você usa nosso serviço.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">2. Informações que Coletamos</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            Coletamos os seguintes tipos de informações:
          </p>
          
          <h3 className="text-xl font-medium mb-2 mt-4 text-emerald-200">2.1 Informações fornecidas por você</h3>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Nome completo e email</li>
            <li>Dados de nascimento e CPF (opcional)</li>
            <li>Informações financeiras (receitas, despesas, metas)</li>
            <li>Dados de contas bancárias e cartões (últimos dígitos apenas)</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2 mt-4 text-emerald-200">2.2 Informações coletadas automaticamente</h3>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Endereço IP e informações do dispositivo</li>
            <li>Dados de uso do serviço</li>
            <li>Cookies e tecnologias similares</li>
            <li>Logs de acesso e navegação</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">3. Como Usamos suas Informações</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Personalizar sua experiência</li>
            <li>Gerar análises e insights financeiros</li>
            <li>Enviar notificações e comunicações importantes</li>
            <li>Proteger contra fraudes e atividades não autorizadas</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">4. Compartilhamento de Informações</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Com seu consentimento explícito</li>
            <li>Para cumprir obrigações legais</li>
            <li>Com prestadores de serviços que nos ajudam a operar o serviço</li>
            <li>Em caso de fusão, aquisição ou venda de ativos</li>
            <li>Para proteger direitos, propriedade ou segurança</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">5. Segurança dos Dados</h2>
          <p className="text-zinc-200 leading-relaxed">
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
            informações, incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200 mt-3">
            <li>Criptografia de dados em trânsito e em repouso</li>
            <li>Controles de acesso rigorosos</li>
            <li>Monitoramento contínuo de segurança</li>
            <li>Auditorias regulares de segurança</li>
            <li>Treinamento de funcionários sobre proteção de dados</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">6. Seus Direitos</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            De acordo com a LGPD, você tem os seguintes direitos:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir dados incorretos ou desatualizados</li>
            <li>Solicitar a exclusão de suas informações</li>
            <li>Solicitar a portabilidade dos dados</li>
            <li>Revogar consentimentos</li>
            <li>Se opor a certos processamentos</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">7. Retenção de Dados</h2>
          <p className="text-zinc-200 leading-relaxed">
            Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os 
            propósitos descritos nesta política, a menos que a lei exija ou permita um período 
            de retenção mais longo. Quando você exclui sua conta, removemos ou anonimizamos 
            suas informações pessoais.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">8. Cookies e Tecnologias Similares</h2>
          <p className="text-zinc-200 leading-relaxed">
            Usamos cookies e tecnologias similares para melhorar sua experiência, analisar o 
            uso do serviço e personalizar conteúdo. Você pode gerenciar suas preferências de 
            cookies através das configurações do seu navegador.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">9. Crianças</h2>
          <p className="text-zinc-200 leading-relaxed">
            Nosso serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente 
            informações de crianças. Se tomarmos conhecimento de que coletamos informações de 
            uma criança, tomaremos medidas para excluir essas informações.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">10. Mudanças nesta Política</h2>
          <p className="text-zinc-200 leading-relaxed">
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
            sobre mudanças significativas enviando um email ou através de um aviso em nosso 
            serviço. Recomendamos revisar esta política regularmente.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">11. Transferências Internacionais</h2>
          <p className="text-zinc-200 leading-relaxed">
            Suas informações podem ser transferidas e processadas em países diferentes do 
            Brasil. Quando isso ocorrer, garantiremos que existam salvaguardas adequadas para 
            proteger suas informações conforme exigido pela LGPD.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">12. Contato</h2>
          <p className="text-zinc-200 leading-relaxed">
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos 
            suas informações, entre em contato conosco:
          </p>
          <div className="mt-3 text-zinc-300">
            <p>Email: privacidade@ofinanceai.com</p>
            <p>DPO (Encarregado de Proteção de Dados): dpo@ofinanceai.com</p>
            <p>Telefone: 0800 123 4567</p>
            <p>Endereço: Av. Principal, 1000 - Centro - São Paulo/SP</p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}