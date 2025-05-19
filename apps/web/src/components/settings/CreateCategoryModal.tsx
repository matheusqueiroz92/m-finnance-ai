'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Switch } from '@/components/ui/switch';
import { useCreateCategory } from '@/hooks/useCategoriesData';
import { categoryCreateSchema } from '@/lib/validators/categoryValidator';
import { useTheme } from 'next-themes';
import { useNotification } from '@/hooks/useNotifications';

type FormValues = z.infer<typeof categoryCreateSchema>;

interface CreateCategoryModalProps {
  isOpen: boolean;
  initialType?: 'income' | 'expense' | 'investment';
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCategoryModal({ 
  isOpen, 
  initialType = 'expense',
  onClose, 
  onSuccess 
}: CreateCategoryModalProps) {
  // Lista de emoji padrão para selecionar como ícones
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showSuccess, showError } = useNotification();
  
  const emojis = [
    '🏠', '🚗', '🍔', '🛒', '💼', '💰', '💳', '🏥', '📚', '🎓', 
    '✈️', '🏨', '🎬', '🎭', '🎮', '🚌', '⛽', '🍽️', '☕', '🎁',
    '👕', '👟', '💄', '💇', '💅', '🏋️', '🚴', '🏊', '📱', '💻',
    '📺', '📟', '🎸', '🎧', '📷', '🔋', '💡', '🧹', '🧺', '🧻'
  ];
  
  const createCategoryMutation = useCreateCategory();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: '',
      type: initialType,
      icon: '',
      color: '',
      isDefault: false,
    },
  });
  
  // Atualizar o tipo com base no initialType quando o modal abrir
  React.useEffect(() => {
    if (isOpen) {
      form.setValue('type', initialType);
    }
  }, [isOpen, initialType, form]);
  
  const onSubmit = (values: FormValues) => {
    // Adicionar o emoji selecionado ao form
    if (selectedEmoji) {
      values.icon = selectedEmoji;
    }
    
    createCategoryMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        setSelectedEmoji(null);
        showSuccess("Categoria criada com sucesso!");
        onSuccess?.();
        onClose();
      },
      onError: () => {
        showError("Erro ao criar categoria. Tente novamente.");
      }
    });
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    form.setValue('icon', emoji);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[500px] ${isDark 
        ? 'bg-[#25343b] border-white/20 text-white' 
        : 'bg-white text-gray-900'}`}>
        <DialogHeader>
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Nova Categoria</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Alimentação, Transporte, Salário" 
                      {...field} 
                      className={isDark 
                        ? 'bg-[#1a2329] border-white/20 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={isDark 
                        ? 'bg-[#1a2329] border-white/20 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={isDark 
                      ? 'bg-[#1a2329] border-white/10 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'}>
                      <SelectItem value="income" className={isDark ? 'text-white' : 'text-gray-900'}>Receita</SelectItem>
                      <SelectItem value="expense" className={isDark ? 'text-white' : 'text-gray-900'}>Despesa</SelectItem>
                      <SelectItem value="investment" className={isDark ? 'text-white' : 'text-gray-900'}>Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className={isDark ? 'text-zinc-300' : 'text-gray-700'}>Ícone</FormLabel>
              <div className={`mt-2 grid grid-cols-10 gap-2 max-h-[160px] overflow-y-auto p-2 rounded-md ${
                isDark ? 'bg-[#1a2329] border border-white/20' : 'bg-gray-50 border border-gray-200'
              }`}>
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`h-8 w-8 flex items-center justify-center rounded-md text-lg ${
                      selectedEmoji === emoji 
                        ? isDark 
                          ? 'bg-emerald-700/50 border border-emerald-500'
                          : 'bg-emerald-100 border border-emerald-300'
                        : isDark
                          ? 'hover:bg-white/10'
                          : 'hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className={`flex flex-row items-center justify-between rounded-md border p-4 
                                     ${isDark 
                                       ? 'border-white/20' 
                                       : 'border-gray-200'}`}>
                  <div className="space-y-0.5">
                    <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Categoria Padrão</FormLabel>
                    <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                      Definir esta como uma categoria padrão do sistema
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
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createCategoryMutation.isPending}
                className={isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createCategoryMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createCategoryMutation.isPending ? 'Criando...' : 'Criar Categoria'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}