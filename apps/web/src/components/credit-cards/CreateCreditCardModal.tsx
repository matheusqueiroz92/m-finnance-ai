'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { creditCardCreateSchema } from '@/lib/validators/creditCardValidator';
import { createCreditCard } from '@/services/creditCardService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { InputMask } from '@/components/shared/InputMask';

type FormValues = z.infer<typeof creditCardCreateSchema>;

interface CreateCreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCreditCardModal({ isOpen, onClose, onSuccess }: CreateCreditCardModalProps) {
  const queryClient = useQueryClient();
  const [showCvv, setShowCvv] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(creditCardCreateSchema),
    defaultValues: {
      cardNumber: '',
      cardBrand: 'visa',
      cardholderName: '',
      cardholderCpf: '',
      expiryDate: '',
      securityCode: '',
      creditLimit: 0,
      billingDueDay: 1,
    },
  });
  
  const createCreditCardMutation = useMutation({
    mutationFn: createCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARD_SUMMARY] });
      form.reset();
      onSuccess?.();
      onClose();
    },
  });
  
  const onSubmit = (values: FormValues) => {
    // Remover possíveis máscaras antes de enviar
    const formattedValues = {
      ...values,
      cardNumber: values.cardNumber.replace(/\D/g, ''),
      cardholderCpf: values.cardholderCpf.replace(/\D/g, ''),
    };
    
    createCreditCardMutation.mutate(formattedValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Cartão de Crédito</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Titular</FormLabel>
                  <FormControl>
                    <Input placeholder="Exatamente como está no cartão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Cartão</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="9999 9999 9999 9999"
                        placeholder="1234 5678 9012 3456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bandeira</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a bandeira" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2c3e44]">
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="elo">Elo</SelectItem>
                        <SelectItem value="american_express">American Express</SelectItem>
                        <SelectItem value="diners">Diners Club</SelectItem>
                        <SelectItem value="hipercard">Hipercard</SelectItem>
                        <SelectItem value="other">Outra</SelectItem>
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
                name="cardholderCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Titular</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="999.999.999-99"
                        placeholder="123.456.789-00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                name="securityCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Segurança (CVV)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showCvv ? "text" : "password"} 
                          placeholder="123"
                          maxLength={4}
                          {...field}
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
              
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Crédito</FormLabel>
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
            
            <FormField
              control={form.control}
              name="billingDueDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia de Vencimento da Fatura</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={31} 
                      placeholder="Dia do mês (1-31)"
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
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createCreditCardMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createCreditCardMutation.isPending}
              >
                {createCreditCardMutation.isPending ? 'Criando...' : 'Criar Cartão'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}