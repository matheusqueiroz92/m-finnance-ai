
'use client';

import React, { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { investmentUpdateSchema } from '@/lib/validators/investmentValidator';
import { getInvestmentById, updateInvestment } from '@/services/investmentService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import CurrencyInput from '@/components/shared/CurrencyInput';

type FormValues = z.infer<typeof investmentUpdateSchema>;

interface UpdateInvestmentModalProps {
  isOpen: boolean;
  investmentId: string;
  onClose: () => void;
}

export function UpdateInvestmentModal({ isOpen, investmentId, onClose }: UpdateInvestmentModalProps) {
  const queryClient = useQueryClient();
  
  const { data: investment, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.INVESTMENT_DETAIL(investmentId)],
    queryFn: () => getInvestmentById(investmentId),
    enabled: isOpen && !!investmentId,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(investmentUpdateSchema),
    defaultValues: {
      name: '',
      ticker: '',
      institution: '',
      investedValue: 0,
      currentValue: 0,
      notes: '',
    },
  });
  
  // Preencher o formulário quando os dados do investimento forem carregados
  useEffect(() => {
    if (investment) {
      form.reset({
        name: investment.name,
        ticker: investment.ticker,
        institution: investment.institution,
        investedValue: investment.investedValue,
        currentValue: investment.currentValue,
        notes: investment.notes,
      });
    }
  }, [investment, form]);
  
  const updateInvestmentMutation = useMutation({
    mutationFn: (data: FormValues) => updateInvestment(investmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTMENT_SUMMARY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTMENT_DETAIL(investmentId)] });
      onClose();
    },
  });
  
  const onSubmit = (values: FormValues) => {
    updateInvestmentMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Atualizar Investimento</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Investimento</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticker/Código</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instituição/Corretora</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="investedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Investido</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value!}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Atual</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value!}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={updateInvestmentMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateInvestmentMutation.isPending}
                >
                  {updateInvestmentMutation.isPending ? 'Atualizando...' : 'Atualizar Investimento'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}