import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowDown, ArrowUp, Receipt, CreditCard, CalendarClock, AlertCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CreditCardBilling } from '@/types/credit-card';

interface CreditCardTransactionsProps {
  transactions?: CreditCardBilling[];
  isLoading: boolean;
  theme?: string;
}

export function CreditCardTransactions({ transactions, isLoading, theme }: CreditCardTransactionsProps) {
  const isDark = theme === 'dark';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white border-none';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black border-none';
      case 'overdue':
        return 'bg-red-500 hover:bg-red-600 text-white border-none';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white border-none';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      default:
        return 'Desconhecido';
    }
  };

  if (isLoading) {
    return (
      <Card className={`border shadow transition-colors duration-200 
                      ${isDark 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                        : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Faturas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className={`border shadow transition-colors duration-200 
                      ${isDark 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                        : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Faturas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className={`h-12 w-12 mb-4 ${isDark ? 'text-zinc-400' : 'text-gray-400'}`} />
            <h3 className={`mb-2 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Nenhuma fatura encontrada
            </h3>
            <p className={`${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Suas faturas aparecerão aqui quando disponíveis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border shadow transition-colors duration-200 
                    ${isDark 
                      ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                      : 'bg-white border-gray-200'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Faturas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className={isDark ? 'border-white/10 hover:bg-white/5' : 'hover:bg-gray-100'}>
              <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Cartão</TableHead>
              <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Fechamento</TableHead>
              <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Vencimento</TableHead>
              <TableHead className={`${isDark ? 'text-zinc-400' : 'text-gray-500'} text-right`}>Valor</TableHead>
              <TableHead className={`${isDark ? 'text-zinc-400' : 'text-gray-500'} text-right`}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((billing) => (
              <TableRow 
                key={billing._id} 
                className={isDark ? 'border-white/10 hover:bg-white/5' : 'hover:bg-gray-100'}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {billing.cardName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={isDark ? 'text-zinc-300' : 'text-gray-700'}>
                  {formatDate(billing.closingDate)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {new Date(billing.dueDate) < new Date() && billing.status !== 'paid' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CalendarClock className={`h-4 w-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`} />
                    )}
                    <span className={isDark ? 'text-zinc-300' : 'text-gray-700'}>
                      {formatDate(billing.dueDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  R$ {billing.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={getStatusColor(billing.status)}>
                    {getStatusText(billing.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}