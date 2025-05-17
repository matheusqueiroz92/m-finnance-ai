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
import { Switch } from '@/components/ui/switch';
import { accountUpdateSchema } from '@/lib/validators/accountValidator';
import { getAccountById, updateAccount } from '@/services/accountService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

type FormValues = z.infer<typeof accountUpdateSchema>;

interface UpdateAccountModalProps {
  isOpen: boolean;
  accountId: string;
  onClose: () => void;
}

export function UpdateAccountModal({ isOpen, accountId, onClose }: UpdateAccountModalProps) {
  const queryClient = useQueryClient();
  
  const { data: account, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_DETAIL(accountId)],
    queryFn: () => getAccountById(accountId),
    enabled: isOpen && !!accountId,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(accountUpdateSchema),
    defaultValues: {
      name: '',
      institution: '',
      bankBranch: '',
      accountNumber: '',
      isActive: true,
    },
  });
  
  // Preencher o formulário quando os dados da conta forem carregados
  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        institution: account.institution,
        bankBranch: account.bankBranch,
        accountNumber: account.accountNumber,
        isActive: account.isActive,
      });
    }
  }, [account, form]);
  
  const updateAccountMutation = useMutation({
    mutationFn: (data: FormValues) => updateAccount(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNT_DETAIL(accountId)] });
      onClose();
    },
  });
  
  const onSubmit = (values: FormValues) => {
    updateAccountMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Atualizar Conta</DialogTitle>
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
                    <FormLabel>Nome da Conta</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Instituição</FormLabel>
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
                  name="bankBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agência</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Conta</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Conta Ativa</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Marque se esta conta está ativa
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
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={updateAccountMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateAccountMutation.isPending}
                >
                  {updateAccountMutation.isPending ? 'Atualizando...' : 'Atualizar Conta'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}