'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

// Importando hooks personalizados
import { useAccountSummary, useTransactionStats, useGoalStats } from '@/hooks/useDashboardData';

// Importando componentes 
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { ExpensesChart } from '@/components/dashboard/ExpensesChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { PageTitle } from '@/components/shared/PageTitle';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const isAuthenticated = !!user;

  // Utilizando hooks personalizados para consultas de dados
  const { data: accountSummary, isLoading: accountLoading } = useAccountSummary(isAuthenticated);
  const { data: transactionStats, isLoading: transactionsLoading } = useTransactionStats(period, isAuthenticated);
  const { data: goalStats, isLoading: goalsLoading } = useGoalStats(isAuthenticated);

  const isDataLoading = authLoading || accountLoading || transactionsLoading || goalsLoading;

  if (authLoading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  return (
    <div className="space-y-8 p-6 min-h-screen bg-white dark:bg-[#25343b] text-gray-800 dark:text-white transition-colors duration-200">
      {/* Cabeçalho de boas-vindas */}
      <PageTitle
        title="Dashboard" 
        description={`Bem-vindo de volta, ${user?.name?.split(' ')[0] || 'Usuário'}! Visualize suas finanças e acompanhe seus gastos.`}
      />
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Saldo Total"
          value={`R$ ${accountSummary?.summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
          trend={{ value: "12%", isPositive: true, text: "desde o último mês" }}
          icon={Wallet}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBackground="bg-emerald-100 dark:bg-emerald-500/20"
          theme={theme}
        />
        
        <SummaryCard
          title="Despesas"
          value={`R$ ${transactionStats?.overview.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
          trend={{ value: "8%", isPositive: false, text: "desde o último mês" }}
          icon={ArrowDownRight}
          iconColor="text-red-600 dark:text-red-400"
          iconBackground="bg-red-100 dark:bg-red-500/20"
          theme={theme}
        />
        
        <SummaryCard
          title="Receitas"
          value={`R$ ${transactionStats?.overview.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
          trend={{ value: "23%", isPositive: true, text: "desde o último mês" }}
          icon={ArrowUpRight}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBackground="bg-emerald-100 dark:bg-emerald-500/20"
          theme={theme}
        />
        
        <SummaryCard
          title="Economia"
          value={`R$ ${((transactionStats?.overview.totalIncome ?? 0) - (transactionStats?.overview.totalExpenses ?? 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={{ value: "18%", isPositive: true, text: "desde o último mês" }}
          icon={TrendingUp}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBackground="bg-purple-100 dark:bg-purple-500/20"
          theme={theme}
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart
          data={transactionStats?.chartData}
          period={period}
          onPeriodChange={setPeriod}
          isLoading={isDataLoading}
          theme={theme}
        />
        
        <ExpensesChart
          data={transactionStats?.expensesByCategory}
          isLoading={isDataLoading}
          theme={theme}
        />
      </div>
      
      {/* Transações Recentes */}
      <RecentTransactions
        transactions={transactionStats?.chartData?.slice(0, 3).map((item, index) => ({
          _id: `transaction-${index}`,
          description: index === 0 ? 'Supermercado Extra' : index === 1 ? 'Salário' : 'Combustível',
          amount: index === 0 ? 425.90 : index === 1 ? 8500.00 : 250.00,
          type: index === 1 ? 'income' : 'expense',
          date: new Date().toISOString(),
          category: { name: index === 0 ? 'Alimentação' : index === 1 ? 'Receita' : 'Transporte' },
          account: { name: 'Conta Principal' }
        }))}
        isLoading={isDataLoading}
        theme={theme}
      />
    </div>
  );
}