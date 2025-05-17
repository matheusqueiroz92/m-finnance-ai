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
import { Target, Plane, Car, Home, Briefcase, Pencil, Trash2 } from 'lucide-react';
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
    </div>
  )
}