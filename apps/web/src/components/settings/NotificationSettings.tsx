'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from '@/components/ui/form';
import { useTheme } from 'next-themes';

interface NotificationSettingsProps {
  // Adicionar propriedades se necessário no futuro
}

interface NotificationFormValues {
  expenseLimits: boolean;
  billReminders: boolean;
  goalProgress: boolean;
  investmentAlerts: boolean;
  weeklyReports: boolean;
  marketUpdates: boolean;
}

export function NotificationSettings({}: NotificationSettingsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const form = useForm<NotificationFormValues>({
    defaultValues: {
      expenseLimits: true,
      billReminders: true,
      goalProgress: true,
      investmentAlerts: false,
      weeklyReports: true,
      marketUpdates: false,
    },
  });
  
  // Na versão atual, essas configurações são apenas visuais
  // Em uma versão completa, cada alteração de switch salvaria no backend

  return (
    <Card className={`border shadow transition-colors duration-200 
                     ${isDark 
                       ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                       : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Notificações</CardTitle>
        <CardDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
          Configure como e quando receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Alertas Financeiros
              </h3>
              
              <FormField
                control={form.control}
                name="expenseLimits"
                render={({ field }) => (
                  <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 
                                       ${isDark 
                                         ? 'border-white/20' 
                                         : 'border-gray-200'}`}>
                    <div className="space-y-0.5">
                      <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Limite de Gastos</FormLabel>
                      <FormDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                        Receba notificações quando ultrapassar limites de gastos definidos
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
              
              <FormField
                control={form.control}
                name="billReminders"
                render={({ field }) => (
                  <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 
                                       ${isDark 
                                         ? 'border-white/20' 
                                         : 'border-gray-200'}`}>
                    <div className="space-y-0.5">
                      <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Lembretes de Contas</FormLabel>
                      <FormDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                        Receba lembretes de contas a vencer
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
              
              <FormField
                control={form.control}
                name="goalProgress"
                render={({ field }) => (
                  <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 
                                       ${isDark 
                                         ? 'border-white/20' 
                                         : 'border-gray-200'}`}>
                    <div className="space-y-0.5">
                      <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Progresso de Objetivos</FormLabel>
                      <FormDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                        Receba atualizações sobre o progresso dos seus objetivos financeiros
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
            </div>
            
            <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Relatórios e Insights
              </h3>
              
              <FormField
                control={form.control}
                name="investmentAlerts"
                render={({ field }) => (
                  <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 
                                       ${isDark 
                                         ? 'border-white/20' 
                                         : 'border-gray-200'}`}>
                    <div className="space-y-0.5">
                      <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Alertas de Investimentos</FormLabel>
                      <FormDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                        Receba alertas sobre mudanças significativas em seus investimentos
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
              
              <FormField
                control={form.control}
                name="weeklyReports"
                render={({ field }) => (
                  <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 mt-4
                                       ${isDark 
                                         ? 'border-white/20' 
                                         : 'border-gray-200'}`}>
                    <div className="space-y-0.5">
                      <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Relatórios Semanais</FormLabel>
                      <FormDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                        Receba um resumo semanal das suas finanças
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
              
              <FormField
                control={form.control}
                name="marketUpdates"
                render={({ field }) => (
                  <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 mt-4
                                       ${isDark 
                                         ? 'border-white/20' 
                                         : 'border-gray-200'}`}>
                    <div className="space-y-0.5">
                      <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Atualizações de Mercado</FormLabel>
                      <FormDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                        Receba notificações sobre mudanças relevantes no mercado financeiro
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
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}