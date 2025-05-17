'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/shared/PageTitle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CreateAccountModal } from '@/components/accounts/CreateAccountModal';
import { UpdateAccountModal } from '@/components/accounts/UpdateAccountModal';
import { AccountList } from '@/components/accounts/AccountList';
import { AccountSummary } from '@/components/accounts/AccountSummary';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useAccountsList, useAccountSummary, useDeleteAccount, useRecentAccountTransactions } from '@/hooks/useAccountsData';

export default function AccountsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isAuthenticated = !!user;
  
  // Estados da página
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  
  // Consulta de dados com hooks personalizados
  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } = useAccountsList(isAuthenticated);
  const { data: accountSummary, isLoading: summaryLoading } = useAccountSummary(isAuthenticated);
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentAccountTransactions(isAuthenticated);
  const deleteAccountMutation = useDeleteAccount();
  
  const isLoading = authLoading || accountsLoading || summaryLoading || transactionsLoading;
  
  const handleDeleteAccount = () => {
    if (accountToDelete) {
      deleteAccountMutation.mutate(accountToDelete, {
        onSuccess: () => {
          setAccountToDelete(null);
          refetchAccounts();
        }
      });
    }
  };
  
  if (authLoading) {
    return <LoadingScreen message="Carregando contas..." />;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle 
        title="Contas Bancárias" 
        description="Gerencie suas contas e saldos"
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
      
      {/* Resumo das Contas */}
      <AccountSummary 
        summary={accountSummary?.summary} 
        isLoading={isLoading} 
      />
      
      {/* Lista de Contas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Minhas Contas</h2>
        <AccountList
          accounts={accounts}
          isLoading={isLoading}
          onEdit={setSelectedAccountId}
          onDelete={setAccountToDelete}
          onAddNew={() => setIsCreateModalOpen(true)}
        />
      </div>
      
      {/* Transações Recentes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transações Recentes</h2>
        <RecentTransactions
          transactions={recentTransactions?.transactions?.map(transaction => ({
            ...transaction,
            date: transaction.date.toISOString(),
          }))}
          isLoading={isLoading}
          theme={theme}
        />
      </div>
      
      {/* Modais */}
      <CreateAccountModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {selectedAccountId && (
        <UpdateAccountModal 
          isOpen={!!selectedAccountId}
          accountId={selectedAccountId}
          onClose={() => setSelectedAccountId(null)}
        />
      )}
      
      {/* Confirmação de exclusão */}
      {accountToDelete && (
        <ConfirmDialog
          title="Excluir Conta"
          description="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita e todas as transações associadas serão removidas."
          triggerButton={<span style={{ display: 'none' }}></span>}
          confirmButton={{
            label: 'Excluir',
            variant: 'destructive',
          }}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}