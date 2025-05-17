import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Wallet, TrendingUp, CreditCard, Pencil, Trash2, Eye, Plus, Landmark } from 'lucide-react';
import { Account } from '@/types/account';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTheme } from 'next-themes';

interface AccountListProps {
  accounts?: Account[];
  isLoading: boolean;
  onEdit: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onAddNew: () => void;
  onViewTransactions?: (accountId: string) => void;
}

export function AccountList({ 
  accounts, 
  isLoading, 
  onEdit, 
  onDelete, 
  onAddNew,
  onViewTransactions 
}: AccountListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'savings':
        return <Landmark className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />;
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
          <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-36"></Card>
        ))}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState 
        title="Nenhuma conta encontrada"
        description="Adicione uma nova conta para começar a gerenciar seus recursos financeiros."
        icon={<Wallet className={`h-12 w-12 ${isDark ? 'text-zinc-400' : 'text-gray-400'}`} />}
        actionLabel="Adicionar Conta"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {accounts.map((account) => (
        <Card key={account._id} className={`overflow-hidden border shadow transition-colors duration-200 
                       ${isDark 
                         ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                         : 'bg-white border-gray-200'}`}>
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
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{account.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                      {getAccountTypeLabel(account.type)}{' '}
                      <span className="text-xs">•</span>{' '}
                      {account.institution}
                    </p>
                    <p className={`font-bold text-xl mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'} mt-1`}>
                      {account.bankBranch && `Agência: ${account.bankBranch}`}
                      {account.bankBranch && account.accountNumber && ' • '}
                      {account.accountNumber && `Conta: ${account.accountNumber}`}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={
                      isDark ? 'bg-[#1a2329] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }>
                      <DropdownMenuLabel className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                      <DropdownMenuItem 
                        onClick={() => onEdit(account._id)}
                        className={`cursor-pointer ${
                          isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'
                        }`}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      
                      {onViewTransactions && (
                        <DropdownMenuItem 
                          onClick={() => onViewTransactions(account._id)}
                          className={`cursor-pointer ${
                            isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'
                          }`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver transações
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                      <DropdownMenuItem 
                        onClick={() => onDelete(account._id)}
                        className={`cursor-pointer text-red-600 dark:text-red-400 ${
                          isDark ? 'hover:bg-red-600/10 focus:bg-red-600/10' : 'hover:bg-red-100 focus:bg-red-100'
                        }`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}