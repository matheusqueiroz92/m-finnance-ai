'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Filter, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTitle } from '@/components/shared/PageTitle';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { getTransactions } from '@/services/transactionService';
import { getCategories } from '@/services/categoryService';
import { getAccounts } from '@/services/accountService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { transactionFilterSchema } from '@/lib/validators/transactionValidator';
import { CreateTransactionModal } from '@/components/Transactions/CreateTransactionModal';

const filterSchema = z.object({
  type: z.enum(['income', 'expense', 'investment']).optional(),
  category: z.string().optional(),
  account: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

type FilterFormValues = z.infer<typeof transactionFilterSchema>;

export default function TransactionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  
  const filterForm = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      type: undefined,
      category: undefined,
      account: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      limit: 10,
    },
  });
  
  // Obter filtros atuais
  const filters = filterForm.watch();
  
  // Consulta de transações
  const { 
    data: transactionsData, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, { ...filters, page: currentPage }],
    queryFn: () => getTransactions({ ...filters, page: currentPage }),
  });
  
  // Consulta de categorias para o filtro
  const { data: categories } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => getCategories(),
  });
  
  // Consulta de contas para o filtro
  const { data: accounts } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: () => getAccounts(),
  });
  
  const handleFilter = (values: FilterFormValues) => {
    setCurrentPage(1);
    refetchTransactions();
  };
  
  const resetFilter = () => {
    filterForm.reset();
    setCurrentPage(1);
    refetchTransactions();
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const transactionTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className="h-4 w-4 text-emerald-600" />;
      case 'expense':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'investment':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };
  
  const transactionTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-emerald-600';
      case 'expense':
        return 'text-red-600';
      case 'investment':
        return 'text-blue-600';
      default:
        return '';
    }
  };
  
  const transactionTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'investment':
        return 'Investimento';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8">
      <PageTitle 
        title="Transações" 
        description="Gerencie suas movimentações financeiras"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        }
      />
      
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...filterForm}>
            <form 
              onSubmit={filterForm.handleSubmit(handleFilter)} 
              className="flex flex-col sm:flex-row items-end gap-4 flex-wrap"
            >
              <FormField
                control={filterForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto">
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value || 'all'}  // Use um valor válido sempre
                      >
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="investment">Investimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={filterForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto">
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || 'all'}  // Use um valor válido sempre
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={filterForm.control}
                name="account"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto">
                    <FormLabel>Conta</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || 'all'}  // Use um valor válido sempre
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {accounts?.map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={filterForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto">
                    <FormLabel>Data Inicial</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="w-full" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={filterForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto">
                    <FormLabel>Data Final</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="w-full" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <Button type="submit" size="sm">
                  Filtrar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={resetFilter}>
                  Limpar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Tabela de Transações */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTransactions ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                  transactionsData.transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.account.name}</div>
                      </TableCell>
                      <TableCell>{transaction.category.name}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          variant={transaction.type as any} 
                          label={transactionTypeLabel(transaction.type)}
                        />
                      </TableCell>
                      <TableCell className={transactionTypeColor(transaction.type)}>
                        {transaction.type === 'income' ? '+ ' : '- '}
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Abrir menu</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => setSelectedTransactionId(transaction._id)}
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
                    <TableCell colSpan={6} className="text-center py-6">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginação */}
          {transactionsData && transactionsData.pages > 1 && (
            <div className="flex justify-between items-center py-4 px-6">
              <div className="text-sm text-gray-500">
                Mostrando {1 + (currentPage - 1) * transactionsData.limit}-
                {Math.min(currentPage * transactionsData.limit, transactionsData.total)} de{' '}
                {transactionsData.total} resultados
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, transactionsData.pages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={i}
                        variant={pageNumber === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  {transactionsData.pages > 5 && (
                    <>
                      <span>...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(transactionsData.pages)}
                        className="w-8 h-8 p-0"
                      >
                        {transactionsData.pages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === transactionsData.pages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de Criar Transação */}
      <CreateTransactionModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetchTransactions()}
      />
      
      {/* Diálogo de Confirmação para Excluir */}
      {selectedTransactionId && (
        <ConfirmDialog
          title="Excluir Transação"
          description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
          triggerButton={<span style={{ display: 'none' }}></span>}
          confirmButton={{
            label: 'Excluir',
            variant: 'destructive',
          }}
          onConfirm={() => {
            // Implementar a lógica de exclusão
            setSelectedTransactionId(null);
            refetchTransactions();
          }}
        />
      )}
    </div>
  );
}