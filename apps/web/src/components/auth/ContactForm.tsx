'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { contactSchema } from '@/lib/validators/contactValidator';
import { sendContactMessage } from '@/services/contactService';

type FormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await sendContactMessage(values);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoadingOverlay isLoading={isLoading} message="Enviando mensagem...">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-emerald-300">Nome Completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Seu nome" 
                      className="bg-white/10 border-white/20 text-zinc-200 placeholder:text-zinc-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-emerald-300">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="seu@email.com" 
                      className="bg-white/10 border-white/20 text-zinc-200 placeholder:text-zinc-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-emerald-300">Assunto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 text-zinc-200">
                      <SelectValue placeholder="Selecione um assunto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="support">Suporte Técnico</SelectItem>
                    <SelectItem value="billing">Faturamento e Pagamentos</SelectItem>
                    <SelectItem value="feature">Sugestão de Funcionalidade</SelectItem>
                    <SelectItem value="bug">Reportar Bug</SelectItem>
                    <SelectItem value="partnership">Parcerias</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-emerald-300">Mensagem</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Digite sua mensagem aqui..." 
                    className="bg-white/10 border-white/20 text-zinc-200 placeholder:text-zinc-500 min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 pt-6 border-t border-white/20">
        <p className="text-zinc-400 text-sm text-center">
          Ao enviar este formulário, você concorda com nossa{' '}
          <Link href="/politicas-privacidade" className="text-emerald-400 hover:text-emerald-300">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </LoadingOverlay>
  );
}