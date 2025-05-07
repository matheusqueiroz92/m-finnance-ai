'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Target, Pencil, Trash2, ChevronRight, Check, Plane, Car, Home, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTitle } from '@/components/shared/PageTitle';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { getGoals, getGoalStats, deleteGoal } from '@/services/goalService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { UpdateGoalModal } from '@/components/goals/UpdateGoalModal';

export default function ObjetivosPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  // Consulta de objetivos
  const { data: goals, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.GOALS],
    queryFn: () => getGoals(),
  });
  
  // Consulta de estatísticas
  const { data: goalStats } = useQuery({
    queryKey: [QUERY_KEYS.GOAL_STATS],
    queryFn: getGoalStats,
  });
  
  // Mutação para excluir objetivo
  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOAL_STATS] });
      setGoalToDelete(null);
    },
  });
  
  const handleDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoalMutation.mutate(goalToDelete);
    }
  };
  
  const getGoalIcon = (name: string, icon?: string) => {
    if (icon) {
      return icon; // Se houver um ícone personalizado, usar ele
    }
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('viagem') || nameLower.includes('férias')) {
      return <Plane className="h-6 w-6 text-blue-500" />;
    } else if (nameLower.includes('carro') || nameLower.includes('veículo')) {
      return <Car className="h-6 w-6 text-indigo-500" />;
    } else if (nameLower.includes('casa') || nameLower.includes('apartamento')) {
      return <Home className="h-6 w-6 text-emerald-500" />;
    } else if (nameLower.includes('estudo') || nameLower.includes('curso')) {
      return <Briefcase className="h-6 w-6 text-orange-500" />;
    }
    
    return <Target className="h-6 w-6 text-purple-500" />;
  };
  
  const daysUntilTarget = (targetDate: Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="space-y-8">
      <PageTitle 
        title="Objetivos Financeiros" 
        description="Gerencie suas metas e planejamentos"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Objetivo
          </Button>
        }
      />
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold">{goalStats?.totalGoals || 0}</h2>
              <p className="text-sm text-gray-500">Objetivos Ativos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Check className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">{goalStats?.completedGoals || 0}</h2>
              <p className="text-sm text-gray-500">Objetivos Concluídos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <span className="text-purple-600 font-bold">R$</span>
              </div>
              <h2 className="text-xl font-bold">
                R$ {goalStats?.totalCurrentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h2>
              <p className="text-sm text-gray-500">Total Economizado</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <span className="text-indigo-600 font-bold">%</span>
              </div>
              <h2 className="text-xl font-bold">
                {Math.round(goalStats?.overallProgress || 0)}%
              </h2>
              <p className="text-sm text-gray-500">Progresso Geral</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Próximo Objetivo */}
      {goalStats?.nextGoals && goalStats.nextGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Próximo Objetivo</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {typeof getGoalIcon(goalStats.nextGoals[0].name) === 'string' ? (
                    <span className="text-2xl">{getGoalIcon(goalStats.nextGoals[0].name)}</span>
                  ) : (
                    getGoalIcon(goalStats.nextGoals[0].name)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{goalStats.nextGoals[0].name}</h3>
                      <p className="text-sm text-gray-500">
                        Vencimento: {format(new Date(goalStats.nextGoals[0].targetDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {goalStats.nextGoals[0].currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                        R$ {goalStats.nextGoals[0].targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-emerald-600">
                        {daysUntilTarget(goalStats.nextGoals[0].targetDate)} dias restantes
                      </p>
                    </div>
                  </div>
                  <Progress value={goalStats.nextGoals[0].progress} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Objetivos Ativos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Objetivos Ativos</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando...</p>
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <Card key={goal._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                          {typeof getGoalIcon(goal.name, goal.icon) === 'string' ? (
                            <span className="text-xl">{getGoalIcon(goal.name, goal.icon)}</span>
                          ) : (
                            getGoalIcon(goal.name, goal.icon)
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Abrir menu</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedGoalId(goal._id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => setGoalToDelete(goal._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500">Progresso: {Math.round(goal.progress)}%</span>
                        <span className="text-sm font-medium">
                          R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                          R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      {goal.notes && <p className="mb-2">{goal.notes}</p>}
                      <p>
                        {daysUntilTarget(goal.targetDate) > 0 
                          ? `${daysUntilTarget(goal.targetDate)} dias restantes` 
                          : 'Prazo vencido'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Nenhum objetivo encontrado"
            description="Crie seu primeiro objetivo financeiro para começar a planejar seu futuro."
            icon={<Target className="h-12 w-12" />}
            actionLabel="Criar Objetivo"
            onAction={() => setIsCreateModalOpen(true)}
          />
        )}
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
          triggerButton={<span></span>}
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