// src/components/transactions/TransactionsTable.tsx
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ArrowUpRight, ArrowDownRight, TrendingUp, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Transaction, TransactionListResponse } from '@/types/transaction';
import { useTheme } from 'next-themes';

interface TransactionsTableProps {
  data?: TransactionListResponse;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onView: (transaction: Transaction) => void;
}

export function TransactionsTable({ 
  data, isLoading, onPageChange, onEdit, onDelete, onView 
}: TransactionsTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const transactionTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'expense':
        return <ArrowDownRight className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />;
      case 'investment':
        return <TrendingUp className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />;
      default:
        return null;
    }
  };
  
  const transactionTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      case 'investment': return 'Investimento';
      default: return type;
    }
  };

  return (
    <Card className={`border shadow transition-colors duration-200 
                     ${isDark 
                      ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                      : 'bg-white border-gray-200'}`}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={isDark ? 'border-white/10' : 'border-gray-200'}>
                <TableHead className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Data</TableHead>
                <TableHead className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Descrição</TableHead>
                <TableHead className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Categoria</TableHead>
                <TableHead className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Tipo</TableHead>
                <TableHead className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Valor</TableHead>
                <TableHead className={`text-right ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <div className="flex justify-center">
                      <div className="animate-spin h-6 w-6 border-b-2 border-emerald-500 rounded-full"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map((transaction) => (
                  <TableRow key={transaction._id} className={isDark ? 'border-white/10' : 'border-gray-200'}>
                    <TableCell className={isDark ? 'text-white' : 'text-gray-900'}>
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{transaction.description}</div>
                      <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{transaction.account.name}</div>
                    </TableCell>
                    <TableCell className={isDark ? 'text-white' : 'text-gray-900'}>{transaction.category.name}</TableCell>
                    <TableCell>
                      <StatusBadge 
                        variant={transaction.type as any} 
                        label={transactionTypeLabel(transaction.type)}
                      />
                    </TableCell>
                    <TableCell className={`${
                      transaction.type === 'income' 
                      ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                      : (isDark ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {transaction.type === 'income' ? '+ ' : '- '}
                      R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={`${isDark ? 'bg-[#1a2329] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                          <DropdownMenuItem 
                            className={`cursor-pointer ${isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'}`}
                            onClick={() => onView(transaction)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={`cursor-pointer ${isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'}`}
                            onClick={() => onEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={`cursor-pointer text-red-600 dark:text-red-400 ${isDark ? 'hover:bg-red-600/10 focus:bg-red-600/10' : 'hover:bg-red-100 focus:bg-red-100'}`}
                            onClick={() => onDelete(transaction._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className={`text-center py-6 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginação */}
        {data && data.pages > 1 && (
          <div className="flex justify-between items-center py-4 px-6">
            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Mostrando {1 + (data.page - 1) * data.limit}-
              {Math.min(data.page * data.limit, data.total)} de{' '}
              {data.total} resultados
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(data.page - 1)}
                disabled={data.page === 1}
                className={isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}
              >
                Anterior
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={i}
                      variant={pageNumber === data.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(pageNumber)}
                      className={`w-8 h-8 p-0 ${
                        pageNumber === data.page 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : isDark 
                            ? 'border-white/20 text-white hover:bg-white/10' 
                            : ''
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {data.pages > 5 && (
                  <>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(data.pages)}
                      className={`w-8 h-8 p-0 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}`}
                    >
                      {data.pages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(data.page + 1)}
                disabled={data.page === data.pages}
                className={isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}