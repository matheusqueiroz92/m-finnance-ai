import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PerformanceData {
  date: string;
  value: number;
  change: number;
}

interface InvestmentPerformanceChartProps {
  data?: PerformanceData[];
  period: 'month' | 'quarter' | 'year';
  onPeriodChange: (value: 'month' | 'quarter' | 'year') => void;
  isLoading: boolean;
  theme?: string;
}

export function InvestmentPerformanceChart({ 
  data, 
  period, 
  onPeriodChange, 
  isLoading, 
  theme 
}: InvestmentPerformanceChartProps) {
  const isDark = theme === 'dark';

  return (
    <Card className="border shadow transition-colors duration-200 
                    bg-white dark:bg-white/10 dark:backdrop-blur-sm 
                    border-gray-200 dark:border-white/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-emerald-300 transition-colors duration-200">
              Performance
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-zinc-400 transition-colors duration-200">
              Evolução do valor de seus investimentos
            </p>
          </div>
          <Select value={period} onValueChange={(value: any) => onPeriodChange(value)}>
            <SelectTrigger className="w-36 bg-white dark:bg-[#25343b] text-gray-700 dark:text-emerald-300 
                                    border-gray-200 dark:border-white/20 transition-colors duration-200">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#25343b] text-gray-900 dark:text-white 
                                     border-gray-200 dark:border-white/20 transition-colors duration-200">
              <SelectItem value="month" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                               focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Último Mês
              </SelectItem>
              <SelectItem value="quarter" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                                focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Último Trimestre
              </SelectItem>
              <SelectItem value="year" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                                focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Último Ano
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
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} 
                             stroke={isDark ? '#ffffff20' : '#00000020'} />
              <XAxis dataKey="date" 
                     stroke={isDark ? '#ffffff80' : '#00000080'} />
              <YAxis 
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { 
                  notation: 'compact', 
                  compactDisplay: 'short' 
                })}`} 
                stroke={isDark ? '#ffffff80' : '#00000080'}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{ 
                  backgroundColor: isDark ? '#25343b' : '#fff', 
                  borderColor: isDark ? '#ffffff20' : '#e5e7eb', 
                  color: isDark ? '#fff' : '#000' 
                }}
              />
              <ReferenceLine y={0} stroke={isDark ? '#ffffff40' : '#00000040'} />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Valor" 
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
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