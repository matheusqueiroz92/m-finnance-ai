import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuTrigger, 
  DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { Account } from '@/types/account';
import { useTheme } from 'next-themes';

interface AccountsListProps {
  accounts: Account[] | undefined;
  isLoading: boolean;
}

export function AccountsList({ accounts, isLoading }: AccountsListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'savings':
        return <Wallet className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />;
      case 'investment':
        return <TrendingUp className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />;
      case 'credit':
        return <CreditCard className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />;
      default:
        return <Wallet className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
    }
  };
  
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return isDark ? 'bg-emerald-500/20' : 'bg-emerald-100';
      case 'savings':
        return isDark ? 'bg-blue-500/20' : 'bg-blue-100';
      case 'investment':
        return isDark ? 'bg-indigo-500/20' : 'bg-indigo-100';
      case 'credit':
        return isDark ? 'bg-purple-500/20' : 'bg-purple-100';
      default:
        return isDark ? 'bg-emerald-500/20' : 'bg-emerald-100';
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32"></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {accounts?.map((account) => (
        <Card key={account._id} className="border shadow transition-colors duration-200 
                                          bg-white dark:bg-white/10 dark:backdrop-blur-sm 
                                          border-gray-200 dark:border-white/20 overflow-hidden">
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      {getAccountTypeLabel(account.type)}{' '}
                      <span className="text-xs">•</span>{' '}
                      {account.institution}
                    </p>
                    <p className="font-bold text-xl mt-2 text-gray-900 dark:text-white">
                      R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      Final: {account.accountNumber?.slice(-4) || '****'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`${isDark ? 'bg-[#1a2329] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                      <DropdownMenuLabel className={`${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator className={`${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <DropdownMenuItem className={`cursor-pointer ${isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'}`}>Editar</DropdownMenuItem>
                      <DropdownMenuItem className={`cursor-pointer ${isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'}`}>Ver transações</DropdownMenuItem>
                      <DropdownMenuSeparator className={`${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <DropdownMenuItem className={`cursor-pointer text-red-600 dark:text-red-400 ${isDark ? 'hover:bg-red-600/10 focus:bg-red-600/10' : 'hover:bg-red-100 focus:bg-red-100'}`}>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!accounts || accounts.length === 0) && (
        <div className="col-span-2 text-center py-10 text-gray-500 dark:text-zinc-400">
          Nenhuma conta encontrada. Adicione uma nova conta para começar.
        </div>
      )}
    </div>
  );
}