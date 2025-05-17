'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/shared/PageTitle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CreateCreditCardModal } from '@/components/credit-cards/CreateCreditCardModal';
import { UpdateCreditCardModal } from '@/components/credit-cards/UpdateCreditCardModal';
import { CreditCardList } from '@/components/credit-cards/CreditCardList';
import { CreditCardSummary } from '@/components/credit-cards/CreditCardSummary';
import { CreditCardTransactions } from '@/components/credit-cards/CreditCardTransactions';
import { 
  useCreditCardsList, 
  useCreditCardSummary, 
  useDeleteCreditCard, 
  useCreditCardTransactions 
} from '@/hooks/useCreditCardsData';

export default function CreditCardsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isAuthenticated = !!user;
  
  // Estados da página
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  
  // Consulta de dados com hooks personalizados
  const { data: creditCards, isLoading: cardsLoading, refetch: refetchCards } = useCreditCardsList(isAuthenticated);
  const { data: summary, isLoading: summaryLoading } = useCreditCardSummary(isAuthenticated);
  const { data: transactions, isLoading: transactionsLoading } = useCreditCardTransactions(isAuthenticated);
  const deleteCardMutation = useDeleteCreditCard();
  
  const isLoading = authLoading || cardsLoading || summaryLoading || transactionsLoading;
  
  const handleDeleteCard = () => {
    if (cardToDelete) {
      deleteCardMutation.mutate(cardToDelete, {
        onSuccess: () => {
          setCardToDelete(null);
          refetchCards();
        }
      });
    }
  };
  
  if (authLoading) {
    return <LoadingScreen message="Carregando cartões de crédito..." />;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle 
        title="Cartões de Crédito" 
        description="Gerencie seus cartões e gastos"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
        }
      />
      
      {/* Resumo dos Cartões */}
      <CreditCardSummary 
        summary={summary} 
        isLoading={isLoading} 
      />
      
      {/* Lista de Cartões */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Meus Cartões</h2>
        <CreditCardList
          creditCards={creditCards}
          isLoading={isLoading}
          onEdit={setSelectedCardId}
          onDelete={setCardToDelete}
          onAddNew={() => setIsCreateModalOpen(true)}
        />
      </div>
      
      {/* Transações Recentes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Faturas Recentes</h2>
        <CreditCardTransactions
          transactions={transactions}
          isLoading={isLoading}
          theme={theme}
        />
      </div>
      
      {/* Modais */}
      <CreateCreditCardModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {selectedCardId && (
        <UpdateCreditCardModal 
          isOpen={!!selectedCardId}
          creditCardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
        />
      )}
      
      {/* Confirmação de exclusão */}
      {cardToDelete && (
        <ConfirmDialog
          title="Excluir Cartão"
          description="Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita e todas as transações associadas serão removidas."
          triggerButton={<span style={{ display: 'none' }}></span>}
          confirmButton={{
            label: 'Excluir',
            variant: 'destructive',
          }}
          onConfirm={handleDeleteCard}
        />
      )}
    </div>
  );
}