'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema } from '@/lib/validators/authValidator';

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      // Você pode adicionar uma notificação de erro aqui
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Coluna da esquerda - Imagem/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-800 text-white p-10 flex-col">
        <div className="flex items-center mb-8">
          <div className="h-8 w-8 mr-2">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">OFinanceAI Finance</h1>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Transforme sua gestão financeira com inteligência artificial</h2>
          <p className="mb-6">Controle suas finanças, defina metas e receba insights personalizados para tomar melhores decisões.</p>
          
          <img 
            src="/images/finance-illustration.svg" 
            alt="Brain thinking about money and savings, minimal style illustration" 
            className="max-w-md mx-auto"
          />
        </div>
      </div>
      
      {/* Coluna da direita - Formulário de Login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8 md:hidden">
            <div className="h-8 w-8 mr-2">
              <svg viewBox="0 0 24 24" fill="#047857" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-emerald-800">OFinanceAI</h1>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</h2>
            <p className="text-gray-600 mt-2">Entre para continuar gerenciando suas finanças</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <Input placeholder="seu@email.com" className="pl-10" {...field} />
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          className="pl-10 pr-10" 
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Lembrar-me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-800">
                  Esqueceu a senha?
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processando...' : 'Entrar'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                <p>Ou continue com</p>
                <div className="flex justify-center space-x-4 mt-4">
                  <Button variant="outline" size="icon" asChild>
                    <Link href="/api/auth/google">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href="/api/auth/apple">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M16.24 5.3c.717.66 1.223 1.658 1.236 2.614-1.354-.14-2.94-.907-3.864-2.022-.842-.902-1.42-2.07-1.236-3.304 1.303.009 2.651.764 3.864 2.712zm3.75 13.39C19.299 19.799 18.384 21 17.25 21c-1.138 0-1.468-.582-2.898-.582-1.461 0-1.838.6-2.898.6-1.136 0-1.976-1.08-2.784-2.16-1.811-2.518-2.006-5.52-.879-7.135.796-1.127 2.048-1.811 3.222-1.811 1.191 0 1.937.589 2.919.589.96 0 1.545-.582 2.927-.582 1.05 0 2.177.431 2.971 1.17-2.619 1.4-2.198 5.056.16 5.991z"
                          fill="#000"
                        />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link href="/register" className="text-emerald-600 hover:text-emerald-800 font-medium">
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}