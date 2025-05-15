'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CreditCard, Wallet, TrendingUp, MoreVertical, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTitle } from '@/components/shared/PageTitle';
import { getAccounts, getAccountSummary } from '@/services/accountService';
import { getTransactions } from '@/services/transactionService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { CreateAccountModal } from '@/components/wallet/CreateAccountModal';

export default function WalletPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: accounts } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: getAccounts,
  });
  
  const { data: accountSummary } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY],
    queryFn: getAccountSummary,
  });
  
  const { data: recentTransactions } = useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, { limit: 3 }],
    queryFn: () => getTransactions({ limit: 3, page: 1 }),
  });
  
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5 text-emerald-600" />;
      case 'savings':
        return <Wallet className="h-5 w-5 text-blue-600" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5 text-indigo-600" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      default:
        return <Wallet className="h-5 w-5 text-emerald-600" />;
    }
  };
  
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-emerald-100';
      case 'savings':
        return 'bg-blue-100';
      case 'investment':
        return 'bg-indigo-100';
      case 'credit':
        return 'bg-purple-100';
      default:
        return 'bg-emerald-100';
    }
  };
  
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Conta Corrente';
      case 'savings':
        return 'Poupança';
      case 'investment':
        return 'Conta Investimento';
      case 'credit':
        return 'Cartão de Crédito';
      default:
        return 'Conta';
    }
  };

  return (
    <div className="space-y-8">
      <PageTitle 
        title="Carteira" 
        description="Gerencie seus saldos e contas"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        }
      />
      
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Saldo Total</p>
                <h3 className="text-2xl font-bold mt-1">
                  R$ {accountSummary?.summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </h3>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <ArrowUp size={14} className="mr-1" /> 
                  2.5% desde o último mês
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
                <p className="text-sm font-medium text-gray-500">Receitas (Mês Atual)</p>
                <h3 className="text-2xl font-bold mt-1">R$ 8.500,00</h3>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <ArrowUp size={14} className="mr-1" /> 
                  12% desde o último mês
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <ArrowUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Despesas (Mês Atual)</p>
                <h3 className="text-2xl font-bold mt-1">R$ 3.750,00</h3>
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <ArrowDown size={14} className="mr-1" /> 
                  5% desde o último mês
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Minhas Contas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Minhas Contas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts?.map((account) => (
            <Card key={account._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start">
                  <div className={`${getAccountTypeColor(account.type)} p-6 flex items-center justify-center h-full`}>
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getAccountIcon(account.type)}
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-sm text-gray-500">
                          {getAccountTypeLabel(account.type)}{' '}
                          <span className="text-xs">•</span>{' '}
                          {account.institution}
                        </p>
                        <p className="font-bold text-xl mt-2">
                          R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Final: {account.accountNumber?.slice(-4) || '****'}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Ver transações</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Transações Recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transações Recentes</h2>
          <Button variant="outline" asChild>
            <a href="/transacoes">Ver todas</a>
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentTransactions?.transactions.map((transaction) => (
                <div 
                  key={transaction._id} 
                  className="flex items-center justify-between p-6"
                >
                  <div className="flex items-center">
                    {transaction.type === 'income' ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                        <ArrowUp className="h-5 w-5 text-emerald-600" />
                      </div>
                    ) : transaction.type === 'expense' ? (
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                        <ArrowDown className="h-5 w-5 text-red-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.category.name}{' '}
                        <span className="text-xs">•</span>{' '}
                        {transaction.account.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'income' 
                        ? 'text-emerald-600' 
                        : transaction.type === 'expense' 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                    }`}>
                      {transaction.type === 'income' ? '+ ' : '- '}
                      R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!recentTransactions?.transactions || recentTransactions.transactions.length === 0) && (
                <div className="p-6 text-center text-gray-500">
                  Nenhuma transação recente encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de Criar Conta */}
      <CreateAccountModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}