'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { transactionCreateSchema } from '@/lib/validators/transactionValidator';
import { createTransaction } from '@/services/transactionService';
import { getAccounts } from '@/services/accountService';
import { getCategories } from '@/services/categoryService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';

type FormValues = z.infer<typeof transactionCreateSchema>;

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTransactionModal({ isOpen, onClose, onSuccess }: CreateTransactionModalProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'investment'>('expense');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(transactionCreateSchema),
    defaultValues: {
      account: '',
      category: '',
      amount: 0,
      type: activeTab,
      description: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      notes: '',
    },
  });
  
  // Atualizar tipo com base na tab ativa
  React.useEffect(() => {
    form.setValue('type', activeTab);
  }, [activeTab, form]);
  
  // Consulta de contas
  const { data: accounts } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: getAccounts,
  });
  
  // Consulta de categorias filtradas por tipo
  const { data: categories } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, activeTab],
    queryFn: () => getCategories(activeTab),
  });
  
  const createTransactionMutation = useMutation({
    mutationFn: (data: { formData: FormValues; files: File[] }) => 
      createTransaction(data.formData, data.files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY] });
      form.reset();
      setSelectedFiles([]);
      onSuccess?.();
      onClose();
    },
  });
  
  const onSubmit = (values: FormValues) => {
    createTransactionMutation.mutate({ formData: values, files: selectedFiles });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Transação</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="income" className="flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Receita
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center">
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Despesa
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Investimento
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Supermercado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma conta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Transação Recorrente</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Esta transação se repete regularmente?
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {form.watch('isRecurring') && (
                <FormField
                  control={form.control}
                  name="recurrenceInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intervalo de Recorrência</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o intervalo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Adicione informações complementares" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Upload de anexos */}
              <div className="space-y-2">
                <FormLabel>Anexos</FormLabel>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Input
                    type="file"
                    id="attachments"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="attachments" 
                    className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                  >
                    Arraste arquivos ou escolha um arquivo
                    <p className="text-xs mt-1">PDF, PNG ou JPG até 5MB</p>
                  </label>
                </div>
                
                {/* Lista de arquivos selecionados */}
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Arquivos selecionados:</p>
                    <ul className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="text-sm flex justify-between items-center">
                          <span>{file.name}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFile(index)}
                          >
                            &times;
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={createTransactionMutation.isPending || isUploading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createTransactionMutation.isPending || isUploading}
                >
                  {createTransactionMutation.isPending ? 'Criando...' : 'Criar Transação'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}