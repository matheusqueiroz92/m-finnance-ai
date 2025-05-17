'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/shared/PageTitle';
import { CreateAccountModal } from '@/components/wallet/CreateAccountModal';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AccountsSummary } from '@/components/wallet/AccountsSummary';
import { AccountsList } from '@/components/wallet/AccountsList';
import { useAccounts, useAccountSummary, useRecentTransactions } from '@/hooks/useWalletData';

export default function WalletPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isAuthenticated = !!user;
  
  // Usar hooks personalizados
  const { data: accounts, isLoading: accountsLoading } = useAccounts(isAuthenticated);
  const { data: accountSummary, isLoading: summaryLoading } = useAccountSummary(isAuthenticated);
  const { data: transactionsData, isLoading: transactionsLoading } = useRecentTransactions(isAuthenticated);
  
  const isLoading = authLoading || accountsLoading || summaryLoading || transactionsLoading;
  
  if (authLoading) {
    return <LoadingScreen message="Carregando carteira..." />;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle 
        title="Carteira" 
        description="Gerencie seus saldos e contas"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        }
      />
      
      {/* Resumo Financeiro */}
      <AccountsSummary 
        summary={accountSummary?.summary} 
        isLoading={summaryLoading} 
      />
      
      {/* Minhas Contas */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Minhas Contas</h2>
      <AccountsList 
        accounts={accounts} 
        isLoading={accountsLoading} 
      />
      
      {/* Transações Recentes */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Transações Recentes</h2>
      <RecentTransactions
        transactions={transactionsData?.transactions}
        isLoading={transactionsLoading}
        theme={undefined}
      />
      
      {/* Modal de Criar Conta */}
      <CreateAccountModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}