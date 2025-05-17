import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';
import { useTheme } from 'next-themes';

interface InvestmentSummaryProps {
  summary?: {
    totalValue: number;
    totalInvested: number;
    totalReturn: number;
    totalReturnPercentage: number;
    assetCount: number;
  };
  isLoading: boolean;
}

export function InvestmentSummary({ summary, isLoading }: InvestmentSummaryProps) {
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

  const returnIsPositive = summary?.totalReturn ? summary.totalReturn >= 0 : true;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className={`border shadow transition-colors duration-200 
                     ${isDark 
                       ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                       : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Valor Total</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R$ {summary?.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mt-1 flex items-center`}>
                <ArrowUpRight className="h-4 w-4 mr-1" /> 
                Atualizado hoje
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <TrendingUp className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
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
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Total Investido</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R$ {summary?.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'} mt-1`}>
                Capital investido
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <ArrowUpRight className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
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
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Retorno</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                R$ {summary?.totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </h3>
              <p className={`text-xs ${
                returnIsPositive 
                  ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                  : (isDark ? 'text-red-400' : 'text-red-600')
                } mt-1 flex items-center`}>
                {returnIsPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />} 
                {returnIsPositive ? 'Lucro' : 'Prejuízo'} total
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${returnIsPositive 
                            ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                            : (isDark ? 'bg-red-500/20' : 'bg-red-100')
                          }`}>
              {returnIsPositive 
                ? <ArrowUpRight className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                : <ArrowDownRight className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              }
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
              <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-gray-600'}`}>Rentabilidade</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {summary?.totalReturnPercentage.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}%
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'} mt-1`}>
                Rendimento total
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Percent className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}