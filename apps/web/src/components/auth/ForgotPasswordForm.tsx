'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implementar chamada real para API de reset de senha
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="text-emerald-800">
            Email enviado com sucesso! Verifique sua caixa de entrada e siga as instruções 
            para redefinir sua senha.
          </AlertDescription>
        </Alert>
        <Button 
          className="w-full bg-emerald-600 hover:bg-emerald-300 text-[#25343b] p-5"
          onClick={() => window.location.href = '/login'}
        >
          Voltar ao Login
        </Button>
      </div>
    );
  }

  return (
    <LoadingOverlay isLoading={isLoading} message="Enviando email...">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-emerald-300'>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input 
                      placeholder="seu@email.com" 
                      className="bg-zinc-50 p-5 pl-10" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-300 text-[#25343b] p-5" 
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
          </Button>
        </form>
      </Form>
    </LoadingOverlay>
  );
}