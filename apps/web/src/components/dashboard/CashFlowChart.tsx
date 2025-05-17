import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CashFlowData {
  date: string;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data?: CashFlowData[];
  period: 'day' | 'week' | 'month' | 'year';
  onPeriodChange: (value: 'day' | 'week' | 'month' | 'year') => void;
  isLoading: boolean;
  theme?: string;
}

export function CashFlowChart({ data, period, onPeriodChange, isLoading, theme }: CashFlowChartProps) {
  const formattedData = data?.map(item => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <Card className="border shadow transition-colors duration-200 
                    bg-white dark:bg-white/10 dark:backdrop-blur-sm 
                    border-gray-200 dark:border-white/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-emerald-300 transition-colors duration-200">Fluxo de Caixa</CardTitle>
            <CardDescription className="text-gray-500 dark:text-zinc-400 transition-colors duration-200">Evolução de receitas e despesas</CardDescription>
          </div>
          <Select value={period} onValueChange={(value: any) => onPeriodChange(value)}>
            <SelectTrigger className="w-36 bg-white dark:bg-[#25343b] text-gray-700 dark:text-emerald-300 
                                    border-gray-200 dark:border-white/20 transition-colors duration-200">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#25343b] text-gray-900 dark:text-white 
                                     border-gray-200 dark:border-white/20 transition-colors duration-200">
              <SelectItem value="day" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                               focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="week" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                                focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Últimas 12 semanas
              </SelectItem>
              <SelectItem value="month" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                                 focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Últimos 12 meses
              </SelectItem>
              <SelectItem value="year" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                                focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Últimos 5 anos
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : formattedData && formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} 
                             stroke={theme === 'dark' ? '#ffffff20' : '#00000020'} />
              <XAxis dataKey="date" 
                     stroke={theme === 'dark' ? '#ffffff80' : '#00000080'} />
              <YAxis 
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { 
                  notation: 'compact', 
                  compactDisplay: 'short' 
                })}`} 
                stroke={theme === 'dark' ? '#ffffff80' : '#00000080'}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, null]}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#25343b' : '#fff', 
                  borderColor: theme === 'dark' ? '#ffffff20' : '#e5e7eb', 
                  color: theme === 'dark' ? '#fff' : '#000' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Receitas" 
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Despesas" 
                stroke="#ef4444" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-zinc-400 transition-colors duration-200">
            Não há dados suficientes para exibir o gráfico
          </div>
        )}
      </CardContent>
    </Card>
  );
}