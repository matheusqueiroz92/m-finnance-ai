'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Bell, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTitle } from '@/components/shared/PageTitle';
import { useAuth } from '@/lib/auth';
import { userUpdateSchema, changePasswordSchema } from '@/lib/validators/authValidator';
import { updateProfile, changePassword } from '@/services/authService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

type ProfileFormValues = z.infer<typeof userUpdateSchema>;
type PasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { user, updateUserData } = useAuth();
  const queryClient = useQueryClient();
  
  const profileForm = useForm<ProfileFormValues>({
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
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues & { avatar?: File }) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }
      
      return updateProfile(formData);
    },
    onSuccess: (data) => {
      updateUserData(data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
    },
  });
  
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      passwordForm.reset();
    },
  });
  
  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      ...values,
      avatar: avatarFile || undefined,
    });
  };
  
  const onPasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
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
    <div className="space-y-8">
      <PageTitle 
        title="Configurações" 
        description="Personalize sua experiência no OFinanceAI"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="perfil" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex flex-col items-center mb-6">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
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
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                              <SelectItem value="en-US">English (US)</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>
                  Configurações e preferências da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Form {...profileForm}>
                    <form className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="newsletterEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Newsletter</FormLabel>
                              <FormDescription>
                                Receba dicas e novidades sobre finanças
                              </FormDescription>
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
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Assinatura</h3>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-800">Plano Premium</p>
                          <p className="text-sm text-emerald-600">Ativo até 10 de Maio de 2026</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Gerenciar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Sua assinatura será renovada automaticamente. Você pode cancelar a qualquer momento.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
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
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Autenticação em Duas Etapas</CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="twoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Autenticação em Duas Etapas</FormLabel>
                          <FormDescription>
                            Proteja sua conta com um código adicional enviado ao seu celular
                          </FormDescription>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alertas de Gastos</h3>
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Limite de Gastos</FormLabel>
                      <FormDescription>
                        Receba notificações quando ultrapassar limites
                      </FormDescription>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Lembretes</h3>
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Lembretes de Contas</FormLabel>
                      <FormDescription>
                        Receba lembretes de contas a vencer
                      </FormDescription>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}