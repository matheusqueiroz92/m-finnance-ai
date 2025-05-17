import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface ExpensesChartProps {
  data?: ExpenseCategory[];
  isLoading: boolean;
  theme?: string;
}

export function ExpensesChart({ data, isLoading, theme }: ExpensesChartProps) {
  // Cores para os gráficos - Cores que funcionam bem em ambos os temas
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Card className="border shadow transition-colors duration-200 
                    bg-white dark:bg-white/10 dark:backdrop-blur-sm 
                    border-gray-200 dark:border-white/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-emerald-300 transition-colors duration-200">Despesas por Categoria</CardTitle>
            <CardDescription className="text-gray-500 dark:text-zinc-400 transition-colors duration-200">Distribuição dos seus gastos</CardDescription>
          </div>
          <Select defaultValue="month">
            <SelectTrigger className="w-36 bg-white dark:bg-[#25343b] text-gray-700 dark:text-emerald-300 
                                    border-gray-200 dark:border-white/20 transition-colors duration-200">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#25343b] text-gray-900 dark:text-white 
                                     border-gray-200 dark:border-white/20 transition-colors duration-200">
              <SelectItem value="month" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                               focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Este mês
              </SelectItem>
              <SelectItem value="quarter" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                                  focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Este trimestre
              </SelectItem>
              <SelectItem value="year" className="text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-emerald-600/20 
                                               focus:bg-gray-100 dark:focus:bg-emerald-600/20 transition-colors duration-200">
                Este ano
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
          <div className="flex justify-center items-center h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, null]}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#25343b' : '#fff', 
                    borderColor: theme === 'dark' ? '#ffffff20' : '#e5e7eb', 
                    color: theme === 'dark' ? '#fff' : '#000' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-zinc-400 transition-colors duration-200">
            Não há dados suficientes para exibir o gráfico
          </div>
        )}
      </CardContent>
    </Card>
  );
}