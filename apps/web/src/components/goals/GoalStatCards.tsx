import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Check } from 'lucide-react';
import { GoalStats } from '@/types/goal';
import { useTheme } from 'next-themes';

interface GoalStatCardsProps {
  stats?: GoalStats;
  isLoading: boolean;
}

export function GoalStatCards({ stats, isLoading }: GoalStatCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24"></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className={`border shadow transition-colors duration-200 
                      ${isDark 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                        : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                            ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <Target className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats?.totalGoals || 0}
            </h2>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Objetivos Ativos</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`border shadow transition-colors duration-200 
                      ${isDark 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                        : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                            ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Check className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats?.completedGoals || 0}
            </h2>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Objetivos Concluídos</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`border shadow transition-colors duration-200 
                      ${isDark 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                        : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                            ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <span className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>R$</span>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              R$ {stats?.totalCurrentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </h2>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Total Economizado</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`border shadow transition-colors duration-200 
                      ${isDark 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                        : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                            ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
              <span className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>%</span>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(stats?.overallProgress || 0)}%
            </h2>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Progresso Geral</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}