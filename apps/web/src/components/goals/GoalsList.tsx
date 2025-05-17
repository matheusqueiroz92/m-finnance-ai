import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { 
  Target, Plane, Car, Home, Briefcase, Pencil, Trash2, MoreVertical, Plus
} from 'lucide-react';
import { Goal } from '@/types/goal';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTheme } from 'next-themes';

interface GoalsListProps {
  goals?: Goal[];
  isLoading: boolean;
  onEdit: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onAddNew: () => void;
}

export function GoalsList({ goals, isLoading, onEdit, onDelete, onAddNew }: GoalsListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getGoalIcon = (name: string, icon?: string) => {
    if (icon) {
      return icon; // Se houver um ícone personalizado, usar ele
    }
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('viagem') || nameLower.includes('férias')) {
      return <Plane className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />;
    } else if (nameLower.includes('carro') || nameLower.includes('veículo')) {
      return <Car className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />;
    } else if (nameLower.includes('casa') || nameLower.includes('apartamento')) {
      return <Home className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />;
    } else if (nameLower.includes('estudo') || nameLower.includes('curso')) {
      return <Briefcase className={`h-5 w-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />;
    }
    
    return <Target className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />;
  };
  
  const daysUntilTarget = (targetDate: Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48"></Card>
        ))}
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <EmptyState 
        title="Nenhum objetivo encontrado"
        description="Crie seu primeiro objetivo financeiro para começar a planejar seu futuro."
        icon={<Target className={`h-12 w-12 ${isDark ? 'text-zinc-400' : 'text-gray-400'}`} />}
        actionLabel="Criar Objetivo"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {goals.map((goal) => (
        <Card key={goal._id} className={`overflow-hidden border shadow transition-colors duration-200 
                      ${isDark 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                        : 'bg-white border-gray-200'}`}>
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full ${
                    isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                  } flex items-center justify-center mr-4`}>
                    {typeof getGoalIcon(goal.name, goal.icon) === 'string' ? (
                      <span className="text-xl">{getGoalIcon(goal.name, goal.icon)}</span>
                    ) : (
                      getGoalIcon(goal.name, goal.icon)
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{goal.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                      Vencimento: {formatDate(goal.targetDate)}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="sr-only">Abrir menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={
                    isDark ? 'bg-[#1a2329] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }>
                    <DropdownMenuItem 
                      onClick={() => onEdit(goal._id)}
                      className={`cursor-pointer ${
                        isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'
                      }`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(goal._id)}
                      className={`cursor-pointer text-red-600 dark:text-red-400 ${
                        isDark ? 'hover:bg-red-600/10 focus:bg-red-600/10' : 'hover:bg-red-100 focus:bg-red-100'
                      }`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                    Progresso: {Math.round(goal.progress)}%
                  </span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                    R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Progress 
                  value={goal.progress} 
                  className={`h-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} 
                />
              </div>
              
              <div className={`mt-4 text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                {goal.notes && <p className="mb-2">{goal.notes}</p>}
                <p className={daysUntilTarget(goal.targetDate) > 0 
                  ? `${isDark ? 'text-emerald-400' : 'text-emerald-600'}`
                  : `${isDark ? 'text-red-400' : 'text-red-600'}`}
                >
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
  );
}