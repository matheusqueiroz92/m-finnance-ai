import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, CreditCard, ChevronRight } from 'lucide-react';

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'investment';
  category: {
    name: string;
  };
  account: {
    name: string;
  };
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading: boolean;
  theme?: string;
}

export function RecentTransactions({ transactions, isLoading, theme }: RecentTransactionsProps) {
  return (
    <Card className="border shadow transition-colors duration-200 
                    bg-white dark:bg-white/10 dark:backdrop-blur-sm 
                    border-gray-200 dark:border-white/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 dark:text-emerald-300 transition-colors duration-200">Transações Recentes</CardTitle>
          <Link href="/transactions" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center transition-colors duration-200">
            Ver todas
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/10 last:border-0 transition-colors duration-200">
                <div className="flex items-center">
                  {transaction.type === 'income' ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mr-4 transition-colors duration-200">
                      <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-200" />
                    </div>
                  ) : transaction.type === 'expense' ? (
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mr-4 transition-colors duration-200">
                      <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400 transition-colors duration-200" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mr-4 transition-colors duration-200">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-200" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{transaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 transition-colors duration-200">
                      {transaction.category.name} • {transaction.account.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'income' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-600 dark:text-red-400'
                  } transition-colors duration-200`}>
                    {transaction.type === 'income' ? '+ ' : '- '}
                    R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 transition-colors duration-200">
                    {format(new Date(transaction.date), 'dd MMM yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500 dark:text-zinc-400 transition-colors duration-200">
            Nenhuma transação recente encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}