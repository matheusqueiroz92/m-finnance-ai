'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
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

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      setError('Token inválido. Por favor, solicite um novo link de redefinição.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simular reset de senha
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implementar chamada real para API com o token
      router.push('/login?reset=success');
    } catch (error) {
      setError('Erro ao redefinir senha. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoadingOverlay isLoading={isLoading} message="Redefinindo senha...">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-emerald-300'>Nova Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="p-5 pl-10 pr-10 bg-zinc-50"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-emerald-300'>Confirmar Nova Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      className="p-5 pl-10 pr-10 bg-zinc-50"
                      placeholder='•••••••••'
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-sm text-zinc-300">
            <p>A senha deve conter:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Pelo menos 6 caracteres</li>
              <li>Letras maiúsculas e minúsculas</li>
              <li>Números e caracteres especiais (recomendado)</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-300 text-[#25343b] p-5"
            disabled={isLoading}
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>
      </Form>
    </LoadingOverlay>
  );
}