import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/types/goal';
import { Plane, Car, Home, Briefcase, Target } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NextGoalCardProps {
  goal?: Goal;
  isLoading: boolean;
}

export function NextGoalCard({ goal, isLoading }: NextGoalCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getGoalIcon = (name: string, icon?: string) => {
    if (icon) {
      return icon; // Se houver um ícone personalizado, usar ele
    }
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('viagem') || nameLower.includes('férias')) {
      return <Plane className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />;
    } else if (nameLower.includes('carro') || nameLower.includes('veículo')) {
      return <Car className={`h-6 w-6 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />;
    } else if (nameLower.includes('casa') || nameLower.includes('apartamento')) {
      return <Home className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />;
    } else if (nameLower.includes('estudo') || nameLower.includes('curso')) {
      return <Briefcase className={`h-6 w-6 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />;
    }
    
    return <Target className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />;
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
      <Card className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 w-full"></Card>
    );
  }

  if (!goal) {
    return null;
  }

  return (
    <Card className={`border shadow transition-colors duration-200 
                    ${isDark 
                      ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                      : 'bg-white border-gray-200'}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 
                          ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            {typeof getGoalIcon(goal.name) === 'string' ? (
              <span className="text-2xl">{getGoalIcon(goal.name)}</span>
            ) : (
              getGoalIcon(goal.name)
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {goal.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                  Vencimento: {format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                  R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {daysUntilTarget(goal.targetDate)} dias restantes
                </p>
              </div>
            </div>
            <Progress value={goal.progress} className={`h-2 mt-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}