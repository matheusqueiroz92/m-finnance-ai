import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, DollarSign, CalendarClock } from 'lucide-react';
import { useTheme } from 'next-themes';

interface CreditCardSummaryProps {
  summary?: {
    totalCards: number;
    totalCreditLimit: number;
    totalAvailableLimit: number;
    totalCurrentBalance: number;
    nextDueDate: string;
    nextDueAmount: number;
  };
  isLoading: boolean;
}

export function CreditCardSummary({ summary, isLoading }: CreditCardSummaryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24"></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className={`border shadow transition-colors duration-200 
                     ${isDark 
                       ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                       : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Limite Total</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R$ {summary?.totalCreditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'} mt-1`}>
                {summary?.totalCards || 0} cartões ativos
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <CreditCard className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border shadow transition-colors duration-200 
                    ${isDark 
                      ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                      : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Fatura Atual</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R$ {summary?.totalCurrentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'} mt-1`}>
                {((summary?.totalCurrentBalance || 0) / (summary?.totalCreditLimit || 1) * 100).toFixed(1)}% do limite utilizado
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <DollarSign className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`border shadow transition-colors duration-200 
                    ${isDark 
                      ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                      : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Próximo Vencimento</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {summary?.nextDueDate ? formatDate(summary.nextDueDate) : 'Não há'}
              </h3>
              <p className={`text-xs ${
                summary?.nextDueAmount 
                  ? (isDark ? 'text-red-400' : 'text-red-600') 
                  : (isDark ? 'text-zinc-400' : 'text-gray-500')
              } mt-1`}>
                {summary?.nextDueAmount 
                  ? `R$ ${summary.nextDueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : 'Nenhuma fatura pendente'
                }
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <CalendarClock className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}