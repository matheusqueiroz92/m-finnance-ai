"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TransactionsFilter } from "@/components/transactions/TransactionsFilter";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { CreateTransactionModal } from "@/components/transactions/CreateTransactionModal";
import { UpdateTransactionModal } from "@/components/transactions/UpdateTransactionModal";
import { ViewTransactionModal } from "@/components/transactions/ViewTransactionModal";
import {
  useTransactionsList,
  useCategories,
  useAccountsList,
  useDeleteTransaction,
} from "@/hooks/useTransactionsData";
import { Transaction, TransactionFilters } from "@/types/transaction";

export default function TransactionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  // Estados da página
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transactionToEditId, setTransactionToEditId] = useState<
    string | null
  >(null);
  const [transactionToViewId, setTransactionToViewId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  });

  // Consulta de dados com hooks personalizados
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useTransactionsList({ ...filters, page: currentPage }, isAuthenticated);
  const { data: categories, isLoading: categoriesLoading } =
    useCategories(isAuthenticated);
  const { data: accounts, isLoading: accountsLoading } =
    useAccountsList(isAuthenticated);
  const deleteTransactionMutation = useDeleteTransaction();

  const isLoading =
    authLoading || transactionsLoading || categoriesLoading || accountsLoading;

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
    setTransactionToEditId(transaction._id);
  };

  const handleDelete = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };

  const handleView = (transaction: Transaction) => {
    setTransactionToViewId(transaction._id);
  };

  const confirmDelete = () => {
    if (selectedTransactionId) {
      deleteTransactionMutation.mutate(selectedTransactionId, {
        onSuccess: () => {
          setSelectedTransactionId(null);
          refetchTransactions();
        },
      });
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedTransactionId(null);
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
            className="bg-emerald-600 rounded-full hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
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

      {/* Modal de Editar Transação */}
      <UpdateTransactionModal
        isOpen={!!transactionToEditId}
        transactionId={transactionToEditId}
        onClose={() => setTransactionToEditId(null)}
        onSuccess={() => refetchTransactions()}
      />

      {/* Modal de Visualizar Transação */}
      <ViewTransactionModal
        isOpen={!!transactionToViewId}
        transactionId={transactionToViewId}
        onClose={() => setTransactionToViewId(null)}
      />

      {/* Diálogo de Confirmação para Excluir */}
      {selectedTransactionId && (
        <ConfirmDialog
          title="Excluir Transação"
          description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
          open={!!selectedTransactionId}
          onOpenChange={handleDeleteDialogOpenChange}
          triggerButton={<span style={{ display: "none" }}></span>}
          confirmButton={{
            label: deleteTransactionMutation.isPending ? "Excluindo..." : "Excluir",
            variant: "destructive",
            disabled: deleteTransactionMutation.isPending,
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
