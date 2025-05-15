'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Mail, Lock, Calendar } from 'lucide-react';
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
import { useAuth } from '@/lib/auth';
import { registerSchema } from '@/lib/validators/authValidator';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      cpf: '',
      phone: '',
      language: 'pt-BR',
    },
  });

  const onSubmit = async (values: any) => {
    await registerUser(values);
  };

  return (
    <LoadingOverlay isLoading={isLoading} message="Criando sua conta...">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-emerald-300'>Nome Completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input placeholder="Seu nome completo" className="bg-zinc-50 p-5 pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-emerald-300'>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input placeholder="seu@email.com" className="bg-zinc-50 p-5 pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-emerald-300'>Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      className="bg-zinc-50 p-5 pl-10 pr-10"
                      placeholder='•••••••••'
                      {...field} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-emerald-300'>Data de Nascimento</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <Input type="date" className="bg-zinc-50 p-5 pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-emerald-300'>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      className="bg-zinc-50 p-5"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="text-sm text-zinc-50 mt-4">
            Ao clicar em Cadastrar, você concorda com nossos{' '}
            <Link href="/terms-service" target='_blank' className="text-emerald-300 hover:text-emerald-100">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link href="/privacy-policies" target='_blank' className="text-emerald-300 hover:text-emerald-100">
              Política de Privacidade
            </Link>
            .
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-300 text-[#25343b] p-5 mt-6" 
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Cadastrar'}
          </Button>
        </form>
      </Form>
    </LoadingOverlay>
  );
}