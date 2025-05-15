'use client';

import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';

export default function TermsOfServicePage() {
  return (
    <PageContainer title="Termos de Serviço" subtitle="Última atualização: 15 de maio de 2025">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">1. Aceitação dos Termos</h2>
          <p className="text-zinc-200 leading-relaxed">
            Ao acessar e usar o OFinanceAI, você aceita e concorda em estar vinculado aos seguintes 
            termos e condições de uso. Se você não concordar com qualquer parte destes termos, 
            não deve usar nosso serviço.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">2. Descrição do Serviço</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            O OFinanceAI é uma plataforma de gestão financeira pessoal que oferece:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Controle de despesas e receitas</li>
            <li>Definição e acompanhamento de metas financeiras</li>
            <li>Análises e insights através de inteligência artificial</li>
            <li>Relatórios financeiros personalizados</li>
            <li>Gerenciamento de investimentos</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">3. Uso da Conta</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            Para usar nosso serviço, você deve:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Ter pelo menos 18 anos de idade</li>
            <li>Fornecer informações precisas e completas durante o registro</li>
            <li>Manter a segurança de sua conta e senha</li>
            <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
            <li>Ser responsável por todas as atividades em sua conta</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">4. Privacidade e Dados</h2>
          <p className="text-zinc-200 leading-relaxed">
            Sua privacidade é importante para nós. O uso de suas informações pessoais é regido 
            por nossa <Link href="/politicas-privacidade" className="text-emerald-400 hover:text-emerald-300 underline">Política de Privacidade</Link>. 
            Ao usar o OFinanceAI, você consente com nossa coleta e uso de informações pessoais 
            conforme descrito em nossa política.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">5. Assinatura e Pagamento</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            O OFinanceAI oferece planos de assinatura pagos. Ao se inscrever:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Você autoriza a cobrança recorrente em seu método de pagamento</li>
            <li>As cobranças são feitas antecipadamente</li>
            <li>Você pode cancelar sua assinatura a qualquer momento</li>
            <li>Não oferecemos reembolsos por períodos parciais</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">6. Uso Aceitável</h2>
          <p className="text-zinc-200 leading-relaxed mb-3">
            Você concorda em não usar o OFinanceAI para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-200">
            <li>Violar leis ou regulamentos aplicáveis</li>
            <li>Transmitir vírus ou código malicioso</li>
            <li>Coletar informações de outros usuários sem consentimento</li>
            <li>Interferir na operação do serviço</li>
            <li>Criar múltiplas contas para fins fraudulentos</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">7. Propriedade Intelectual</h2>
          <p className="text-zinc-200 leading-relaxed">
            O OFinanceAI e todo o conteúdo, recursos e funcionalidades são propriedade da 
            Anthropic e são protegidos por leis de direitos autorais, marcas registradas e 
            outras leis de propriedade intelectual.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">8. Limitação de Responsabilidade</h2>
          <p className="text-zinc-200 leading-relaxed">
            O OFinanceAI não se responsabiliza por decisões financeiras tomadas com base nas 
            informações fornecidas pelo serviço. As análises e recomendações são apenas para 
            fins informativos e não constituem aconselhamento financeiro profissional.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">9. Mudanças nos Termos</h2>
          <p className="text-zinc-200 leading-relaxed">
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos 
            os usuários sobre mudanças significativas por email ou através do serviço. O uso 
            continuado após as alterações constitui aceitação dos novos termos.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-emerald-300">10. Contato</h2>
          <p className="text-zinc-200 leading-relaxed">
            Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
          </p>
          <div className="mt-3 text-zinc-300">
            <p>Email: suporte@ofinanceai.com</p>
            <p>Telefone: 0800 123 4567</p>
            <p>Endereço: Av. Principal, 1000 - Centro - São Paulo/SP</p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}