'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { PageTitle } from '@/components/shared/PageTitle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { UpdateGoalModal } from '@/components/goals/UpdateGoalModal';
import { GoalStatCards } from '@/components/goals/GoalStatCards';
import { NextGoalCard } from '@/components/goals/NextGoalCard';
import { GoalsList } from '@/components/goals/GoalsList';
import { useGoalsList, useGoalStats, useDeleteGoal } from '@/hooks/useGoalsData';

export default function GoalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isAuthenticated = !!user;
  
  // Estados da página
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  
  // Consulta de dados com hooks personalizados
  const { data: goals, isLoading: goalsLoading, refetch: refetchGoals } = useGoalsList(isAuthenticated);
  const { data: goalStats, isLoading: statsLoading } = useGoalStats(isAuthenticated);
  const deleteGoalMutation = useDeleteGoal();
  
  const isLoading = authLoading || goalsLoading || statsLoading;
  
  const handleDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoalMutation.mutate(goalToDelete, {
        onSuccess: () => {
          setGoalToDelete(null);
          refetchGoals();
        }
      });
    }
  };
  
  const getNextGoal = () => {
    if (!goalStats?.nextGoals || goalStats.nextGoals.length === 0) return undefined;
    return goalStats.nextGoals[0];
  };
  
  if (authLoading) {
    return <LoadingScreen message="Carregando objetivos..." />;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle 
        title="Objetivos Financeiros" 
        description="Gerencie suas metas e planejamentos"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Objetivo
          </Button>
        }
      />
      
      {/* Estatísticas */}
      <GoalStatCards 
        stats={goalStats} 
        isLoading={isLoading} 
      />
      
      {/* Próximo Objetivo */}
      {goalStats?.nextGoals && goalStats.nextGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Próximo Objetivo</h2>
          <NextGoalCard 
            goal={getNextGoal()} 
            isLoading={isLoading} 
          />
        </div>
      )}
      
      {/* Objetivos Ativos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Objetivos Ativos</h2>
        <GoalsList
          goals={goals}
          isLoading={isLoading}
          onEdit={setSelectedGoalId}
          onDelete={setGoalToDelete}
          onAddNew={() => setIsCreateModalOpen(true)}
        />
      </div>
      
      {/* Modais */}
      <CreateGoalModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {selectedGoalId && (
        <UpdateGoalModal 
          isOpen={!!selectedGoalId}
          goalId={selectedGoalId}
          onClose={() => setSelectedGoalId(null)}
        />
      )}
      
      {/* Confirmação de exclusão */}
      {goalToDelete && (
        <ConfirmDialog
          title="Excluir Objetivo"
          description="Tem certeza que deseja excluir este objetivo? Esta ação não pode ser desfeita."
          triggerButton={<span style={{ display: 'none' }}></span>}
          confirmButton={{
            label: 'Excluir',
            variant: 'destructive',
          }}
          onConfirm={handleDeleteGoal}
        />
      )}
    </div>
  );
}