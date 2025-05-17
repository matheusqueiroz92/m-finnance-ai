'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/shared/PageTitle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TransactionsFilter } from '@/components/transactions/TransactionsFilter';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { CreateTransactionModal } from '@/components/transactions/CreateTransactionModal';
import { useTransactionsList, useCategories, useAccountsList } from '@/hooks/useTransactionsData';
import { Transaction, TransactionFilters } from '@/types/transaction';

export default function TransactionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  
  // Estados da página
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  });
  
  // Consulta de dados com hooks personalizados
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = 
    useTransactionsList({ ...filters, page: currentPage }, isAuthenticated);
  const { data: categories, isLoading: categoriesLoading } = useCategories(isAuthenticated);
  const { data: accounts, isLoading: accountsLoading } = useAccountsList(isAuthenticated);
  
  const isLoading = authLoading || transactionsLoading || categoriesLoading || accountsLoading;
  
  // Manipuladores de eventos
  const handleFilter = (filterValues: TransactionFilters) => {
    setCurrentPage(1);
    setFilters(filterValues);
  };
  
  const resetFilter = () => {
    setFilters({ page: 1, limit: 10 });
    setCurrentPage(1);
    refetchTransactions();
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleEdit = (transaction: Transaction) => {
    console.log('Edit transaction:', transaction);
    // Implementar lógica de edição
  };
  
  const handleDelete = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };
  
  const handleView = (transaction: Transaction) => {
    console.log('View transaction:', transaction);
    // Implementar lógica de visualização
  };
  
  const confirmDelete = () => {
    if (selectedTransactionId) {
      console.log('Delete transaction:', selectedTransactionId);
      // Implementar lógica de exclusão
      setSelectedTransactionId(null);
      refetchTransactions();
    }
  };
  
  if (authLoading) {
    return <LoadingScreen message="Carregando transações..." />;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle 
        title="Transações" 
        description="Gerencie suas movimentações financeiras"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        }
      />
      
      {/* Filtros */}
      <TransactionsFilter 
        onFilter={handleFilter}
        onReset={resetFilter}
        categories={categories}
        accounts={accounts}
        isLoading={isLoading}
      />
      
      {/* Tabela de Transações */}
      <TransactionsTable 
        data={transactionsData}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
      
      {/* Modal de Criar Transação */}
      <CreateTransactionModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetchTransactions()}
      />
      
      {/* Diálogo de Confirmação para Excluir */}
      {selectedTransactionId && (
        <ConfirmDialog
          title="Excluir Transação"
          description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
          triggerButton={<span style={{ display: 'none' }}></span>}
          confirmButton={{
            label: 'Excluir',
            variant: 'destructive',
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}