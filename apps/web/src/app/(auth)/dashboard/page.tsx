'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/lib/auth';
import { getAccountSummary } from '@/services/accountService';
import { getTransactionStats } from '@/services/transactionService';
import { getGoalStats } from '@/services/goalService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  const { data: accountSummary } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY],
    queryFn: getAccountSummary,
  });
  
  const { data: transactionStats, refetch: refetchTransactionStats } = useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION_STATS, period],
    queryFn: () => getTransactionStats(period),
  });
  
  const { data: goalStats } = useQuery({
    queryKey: [QUERY_KEYS.GOAL_STATS],
    queryFn: getGoalStats,
  });
  
  useEffect(() => {
    refetchTransactionStats();
  }, [period, refetchTransactionStats]);
  
  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#3498DB'];
  
  return (
    <div className="space-y-8">
      {/* Cabeçalho de boas-vindas */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo de volta, {user?.name?.split(' ')[0] || 'Usuário'}!</p>
      </div>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Saldo Total</p>
                <h3 className="text-2xl font-bold mt-1">
                  R$ {accountSummary?.summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </h3>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <ArrowUpRight size={14} className="mr-1" /> 
                  12% 
                  <span className="text-gray-500 ml-1">desde o último mês</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Despesas</p>
                <h3 className="text-2xl font-bold mt-1">
                  R$ {transactionStats?.overview.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </h3>
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <ArrowDownRight size={14} className="mr-1" /> 
                  8% 
                  <span className="text-gray-500 ml-1">desde o último mês</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Receitas</p>
                <h3 className="text-2xl font-bold mt-1">
                  R$ {transactionStats?.overview.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </h3>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <ArrowUpRight size={14} className="mr-1" /> 
                  23% 
                  <span className="text-gray-500 ml-1">desde o último mês</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Economia</p>
                <h3 className="text-2xl font-bold mt-1">
                  R$ {((transactionStats?.overview.totalIncome ?? 0) - (transactionStats?.overview.totalExpenses ?? 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <ArrowUpRight size={14} className="mr-1" /> 
                  18% 
                  <span className="text-gray-500 ml-1">desde o último mês</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Fluxo de Caixa */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
                <CardDescription>Evolução de receitas e despesas</CardDescription>
              </div>
              <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Últimos 30 dias</SelectItem>
                  <SelectItem value="week">Últimas 12 semanas</SelectItem>
                  <SelectItem value="month">Últimos 12 meses</SelectItem>
                  <SelectItem value="year">Últimos 5 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {transactionStats?.chartData && transactionStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={transactionStats.chartData.map(item => ({
                    ...item,
                    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
                  }))}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { 
                      notation: 'compact', 
                      compactDisplay: 'short' 
                    })}`} 
                  />
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, null]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    name="Receitas" 
                    stroke="#0088FE" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    name="Despesas" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Não há dados suficientes para exibir o gráfico
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Gráfico de Despesas por Categoria */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição dos seus gastos</CardDescription>
              </div>
              <Select defaultValue="month">
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {transactionStats?.expensesByCategory && transactionStats.expensesByCategory.length > 0 ? (
              <div className="flex justify-center items-center h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={transactionStats.expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {transactionStats.expensesByCategory.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, null]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Não há dados suficientes para exibir o gráfico
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Transações Recentes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transações Recentes</CardTitle>
            <a href="/transacoes" className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center">
              Ver todas
              <ChevronRight size={16} className="ml-1" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactionStats && transactionStats.chartData && transactionStats.chartData.slice(0, 3).map((_, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center">
                  {index === 0 ? (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                  ) : index === 1 ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                      <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {index === 0 ? 'Supermercado Extra' : 
                       index === 1 ? 'Salário' : 'Combustível'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {index === 0 ? 'Alimentação' : 
                       index === 1 ? 'Receita' : 'Transporte'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${index === 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {index === 1 ? '+ R$ 8.500,00' : 
                     index === 0 ? '- R$ 425,90' : '- R$ 250,00'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {index === 0 ? '21 Mar 2025' : 
                     index === 1 ? '20 Mar 2025' : '19 Mar 2025'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}