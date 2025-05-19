'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { changePasswordSchema } from '@/lib/validators/authValidator';
import { usePasswordChange, useCurrentUser, useProfileUpdate } from '@/hooks/useSettingsData';
import { useTheme } from 'next-themes';
import { useNotification } from '@/hooks/useNotifications';

type PasswordFormValues = z.infer<typeof changePasswordSchema>;

interface SecurityFormValues {
  twoFactorEnabled: boolean;
}

export function SecuritySettings() {
  const { user } = useCurrentUser();
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const isDark = theme === 'dark';
  
  const changePasswordMutation = usePasswordChange();
  const updateProfileMutation = useProfileUpdate();
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });
  
  const securityForm = useForm<SecurityFormValues>({
    defaultValues: {
      twoFactorEnabled: user?.twoFactorEnabled || false,
    },
  });
  
  const onPasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          passwordForm.reset();
          showSuccess("Senha alterada com sucesso!");
        },
        onError: () => {
          showError("Erro ao alterar senha. Verifique se a senha atual está correta.");
        }
      }
    );
  };
  
  const onTwoFactorChange = (value: boolean) => {
    updateProfileMutation.mutate(
      { twoFactorEnabled: value },
      {
        onSuccess: () => {
          showSuccess("Configuração de autenticação em duas etapas atualizada!");
        },
        onError: () => {
          showError("Erro ao atualizar configuração de autenticação.");
          // Reverter o switch para o estado anterior em caso de erro
          securityForm.setValue('twoFactorEnabled', !value);
        }
      }
    );
  };

  return (
    <div className="space-y-8">
      <Card className={`border shadow transition-colors duration-200 
                       ${isDark 
                         ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                         : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Alterar Senha</CardTitle>
          <CardDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
            Atualize sua senha para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Senha Atual</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className={isDark 
                          ? 'bg-[#25343b] border-white/20 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Nova Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className={isDark 
                          ? 'bg-[#25343b] border-white/20 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className={isDark 
                          ? 'bg-[#25343b] border-white/20 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className={`border shadow transition-colors duration-200 
                       ${isDark 
                         ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                         : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Autenticação em Duas Etapas</CardTitle>
          <CardDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...securityForm}>
            <form className="space-y-6">
              <FormField
                control={securityForm.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 
                                       ${isDark 
                                         ? 'border-white/20' 
                                         : 'border-gray-200'}`}>
                    <div className="space-y-0.5">
                      <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Autenticação em Duas Etapas</FormLabel>
                      <FormDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                        Proteja sua conta com um código adicional enviado ao seu celular
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          onTwoFactorChange(checked);
                        }}
                        disabled={updateProfileMutation.isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}