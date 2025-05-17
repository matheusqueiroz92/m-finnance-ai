'use client';

import React, { useEffect, useState } from 'react';
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
import { creditCardUpdateSchema } from '@/lib/validators/creditCardValidator';
import { getCreditCardById, updateCreditCard } from '@/services/creditCardService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { InputMask } from '@/components/shared/InputMask';

type FormValues = z.infer<typeof creditCardUpdateSchema>;

interface UpdateCreditCardModalProps {
  isOpen: boolean;
  creditCardId: string;
  onClose: () => void;
}

export function UpdateCreditCardModal({ isOpen, creditCardId, onClose }: UpdateCreditCardModalProps) {
  const queryClient = useQueryClient();
  const [showCvv, setShowCvv] = useState(false);
  
  const { data: creditCard, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CREDIT_CARD_DETAIL(creditCardId)],
    queryFn: () => getCreditCardById(creditCardId),
    enabled: isOpen && !!creditCardId,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(creditCardUpdateSchema),
    defaultValues: {
      cardholderName: '',
      expiryDate: '',
      securityCode: '',
      creditLimit: 0,
      billingDueDay: 1,
      isActive: true,
    },
  });
  
  // Preencher o formulário quando os dados do cartão forem carregados
  useEffect(() => {
    if (creditCard) {
      form.reset({
        cardholderName: creditCard.cardholderName,
        expiryDate: creditCard.expiryDate,
        creditLimit: creditCard.creditLimit,
        billingDueDay: creditCard.billingDueDay,
        isActive: creditCard.isActive,
      });
    }
  }, [creditCard, form]);
  
  const updateCreditCardMutation = useMutation({
    mutationFn: (data: FormValues) => updateCreditCard(creditCardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARD_SUMMARY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARD_DETAIL(creditCardId)] });
      onClose();
    },
  });
  
  const onSubmit = (values: FormValues) => {
    // Filtra campos que não foram alterados (não atualiza código de segurança se estiver vazio)
    const updatedValues = { ...values };
    if (!updatedValues.securityCode) {
      delete updatedValues.securityCode;
    }
    
    updateCreditCardMutation.mutate(updatedValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Atualizar Cartão de Crédito</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Titular</FormLabel>
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
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade</FormLabel>
                      <FormControl>
                        <InputMask
                          mask="99/99"
                          placeholder="MM/AA"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="securityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Novo Código de Segurança (opcional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showCvv ? "text" : "password"} 
                            placeholder="Deixe em branco para manter"
                            maxLength={4}
                            {...field}
                            value={field.value || ''}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowCvv(!showCvv)}
                          >
                            {showCvv ? 'Ocultar' : 'Mostrar'}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Crédito</FormLabel>
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
                  name="billingDueDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia de Vencimento</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={31} 
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 31) {
                              field.onChange(value);
                            }
                          }}
                        />
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
                      <FormLabel>Cartão Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Desmarque se este cartão não estiver mais em uso
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
                  disabled={updateCreditCardMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCreditCardMutation.isPending}
                >
                  {updateCreditCardMutation.isPending ? 'Atualizando...' : 'Atualizar Cartão'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}