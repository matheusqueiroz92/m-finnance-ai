'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/shared/PageTitle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InvestmentPortfolio } from '@/components/investments/InvestmentPorfolio';
import { InvestmentSummary } from '@/components/investments/InvestmentSummary';
import { InvestmentList } from '@/components/investments/InvestmentList';
import { InvestmentPerformanceChart } from '@/components/investments/InvestmentPerformanceChart';
import { CreateInvestmentModal } from '@/components/investments/CreateInvestmentModal';
import { UpdateInvestmentModal } from '@/components/investments/UpdateInvestmentModal';
import { useInvestmentList, useInvestmentSummary, useDeleteInvestment, useInvestmentPerformance } from '@/hooks/useInvestmentsData';

export default function InvestmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isAuthenticated = !!user;
  
  // Estados da página
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  
  // Consulta de dados com hooks personalizados
  const { data: investments, isLoading: investmentsLoading, refetch: refetchInvestments } = useInvestmentList(isAuthenticated);
  const { data: summary, isLoading: summaryLoading } = useInvestmentSummary(isAuthenticated);
  const { data: performance, isLoading: performanceLoading } = useInvestmentPerformance(period, isAuthenticated);
  const deleteInvestmentMutation = useDeleteInvestment();
  
  const isLoading = authLoading || investmentsLoading || summaryLoading || performanceLoading;
  
  const handleDeleteInvestment = () => {
    if (investmentToDelete) {
      deleteInvestmentMutation.mutate(investmentToDelete, {
        onSuccess: () => {
          setInvestmentToDelete(null);
          refetchInvestments();
        }
      });
    }
  };
  
  const handlePeriodChange = (value: 'month' | 'quarter' | 'year') => {
    setPeriod(value);
  };
  
  if (authLoading) {
    return <LoadingScreen message="Carregando investimentos..." />;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle 
        title="Investimentos" 
        description="Gerencie sua carteira de investimentos"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Investimento
          </Button>
        }
      />
      
      {/* Resumo de Investimentos */}
      <InvestmentSummary 
        summary={summary} 
        isLoading={isLoading} 
      />
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestmentPerformanceChart
          data={performance?.performanceData}
          period={period}
          onPeriodChange={handlePeriodChange}
          isLoading={isLoading}
          theme={theme}
        />
        
        <InvestmentPortfolio
          data={summary?.assetAllocation}
          isLoading={isLoading}
          theme={theme}
        />
      </div>
      
      {/* Lista de Investimentos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Meus Investimentos</h2>
        <InvestmentList
          investments={investments}
          isLoading={isLoading}
          onEdit={setSelectedInvestmentId}
          onDelete={setInvestmentToDelete}
          onAddNew={() => setIsCreateModalOpen(true)}
        />
      </div>
      
      {/* Modais */}
      <CreateInvestmentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {selectedInvestmentId && (
        <UpdateInvestmentModal 
          isOpen={!!selectedInvestmentId}
          investmentId={selectedInvestmentId}
          onClose={() => setSelectedInvestmentId(null)}
        />
      )}
      
      {/* Confirmação de exclusão */}
      {investmentToDelete && (
        <ConfirmDialog
          title="Excluir Investimento"
          description="Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita."
          triggerButton={<span style={{ display: 'none' }}></span>}
          confirmButton={{
            label: 'Excluir',
            variant: 'destructive',
          }}
          onConfirm={handleDeleteInvestment}
        />
      )}
    </div>
  );
}