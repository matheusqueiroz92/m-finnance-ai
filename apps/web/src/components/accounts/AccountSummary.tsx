import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AccountSummaryProps {
  summary?: {
    totalBalance: number;
    totalPositiveBalance: number;
    totalNegativeBalance: number;
    accountCount: number;
  };
  isLoading: boolean;
}

export function AccountSummary({ summary, isLoading }: AccountSummaryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Saldo Total</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R$ {summary?.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mt-1 flex items-center`}>
                <ArrowUp size={14} className="mr-1" /> 
                2.5% desde o último mês
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <Wallet className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
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
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Contas Ativas</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {summary?.accountCount || 0}
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'} mt-1`}>
                Total de contas bancárias
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Wallet className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
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
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Saldo Negativo</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R$ {summary?.totalNegativeBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} mt-1 flex items-center`}>
                <ArrowDown size={14} className="mr-1" /> 
                5% desde o último mês
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <ArrowDown className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}