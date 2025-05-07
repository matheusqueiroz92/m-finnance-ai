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
import { goalUpdateSchema } from '@/lib/validators/goalValidator';
import { getGoalById, updateGoal } from '@/services/goalService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import CurrencyInput from '@/components/shared/CurrencyInput';

type FormValues = z.infer<typeof goalUpdateSchema>;

interface UpdateGoalModalProps {
  isOpen: boolean;
  goalId: string;
  onClose: () => void;
}

export function UpdateGoalModal({ isOpen, goalId, onClose }: UpdateGoalModalProps) {
  const queryClient = useQueryClient();
  
  const { data: goal, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.GOAL_DETAIL(goalId)],
    queryFn: () => getGoalById(goalId),
    enabled: isOpen && !!goalId,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(goalUpdateSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      notes: '',
    },
  });
  
  // Preencher o formulário quando os dados do objetivo forem carregados
  useEffect(() => {
    if (goal) {
      form.reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
        notes: goal.notes || '',
      });
    }
  }, [goal, form]);
  
  const updateGoalMutation = useMutation({
    mutationFn: (data: FormValues) => updateGoal(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOAL_STATS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOAL_DETAIL(goalId)] });
      onClose();
    },
  });
  
  const onSubmit = (values: FormValues) => {
    updateGoalMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Atualizar Objetivo</DialogTitle>
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
                    <FormLabel>Nome do Objetivo</FormLabel>
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
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Alvo</FormLabel>
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
                  name="currentAmount"
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
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Alvo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
                  disabled={updateGoalMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateGoalMutation.isPending}
                >
                  {updateGoalMutation.isPending ? 'Atualizando...' : 'Atualizar Objetivo'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}