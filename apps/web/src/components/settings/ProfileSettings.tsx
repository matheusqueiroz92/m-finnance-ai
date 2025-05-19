'use client';

import React, { useState } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useCurrentUser, useProfileUpdate } from '@/hooks/useSettingsData';
import { userUpdateSchema } from '@/lib/validators/authValidator';
import { useTheme } from 'next-themes';
import { useNotification } from '@/hooks/useNotifications';

type FormValues = z.infer<typeof userUpdateSchema>;

export function ProfileSettings() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { user } = useCurrentUser();
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const isDark = theme === 'dark';
  
  const updateProfileMutation = useProfileUpdate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      phone: user?.phone || '',
      language: user?.language || 'pt-BR',
      twoFactorEnabled: user?.twoFactorEnabled || false,
      newsletterEnabled: user?.newsletterEnabled || false,
    },
  });
  
  const onSubmit = (values: FormValues) => {
    updateProfileMutation.mutate(
      {
        ...values,
        avatar: avatarFile,
      },
      {
        onSuccess: () => {
          showSuccess("Perfil atualizado com sucesso!");
        },
        onError: () => {
          showError("Erro ao atualizar perfil. Tente novamente.");
        }
      }
    );
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className={`border shadow transition-colors duration-200 
                       ${isDark 
                         ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                         : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Informações Pessoais</CardTitle>
          <CardDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name} />
                  <AvatarFallback className={isDark ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-600 text-white'}>
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <Input
                    type="file"
                    id="avatar"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="avatar" className="cursor-pointer">
                      Alterar Foto
                    </label>
                  </Button>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Nome Completo</FormLabel>
                    <FormControl>
                      <Input 
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
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Email</FormLabel>
                    <FormControl>
                      <Input 
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ''} 
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
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Telefone</FormLabel>
                      <FormControl>
                        <Input 
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
              </div>
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Idioma</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={isDark 
                          ? 'bg-[#25343b] border-white/20 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'}>
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={isDark 
                        ? 'bg-[#1a2329] border-white/10 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'}>
                        <SelectItem value="pt-BR" className={isDark ? 'text-white' : 'text-gray-900'}>Português (Brasil)</SelectItem>
                        <SelectItem value="en-US" className={isDark ? 'text-white' : 'text-gray-900'}>English (US)</SelectItem>
                        <SelectItem value="es" className={isDark ? 'text-white' : 'text-gray-900'}>Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
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
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Preferências</CardTitle>
          <CardDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
            Configurações e preferências da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="newsletterEnabled"
                  render={({ field }) => (
                    <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 
                                        ${isDark 
                                          ? 'border-white/20' 
                                          : 'border-gray-200'}`}>
                      <div className="space-y-0.5">
                        <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Newsletter</FormLabel>
                        <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                          Receba dicas e novidades sobre finanças
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
              </form>
            </Form>
            
            <div className={`border-t pt-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Assinatura</h3>
              <div className={`bg-emerald-50 border rounded-md p-4 mb-4 
                              ${isDark 
                                ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-300' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Plano Premium</p>
                    <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Ativo até 10 de Maio de 2026</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={isDark ? 'border-emerald-700 text-emerald-300 hover:bg-emerald-900/30' : ''}
                  >
                    Gerenciar
                  </Button>
                </div>
              </div>
              
              <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                Sua assinatura será renovada automaticamente. Você pode cancelar a qualquer momento.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}