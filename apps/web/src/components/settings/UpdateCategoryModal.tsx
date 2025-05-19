'use client'

import React, { useState, useEffect } from 'react';
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
import { useCategoryDetail, useUpdateCategory } from '@/hooks/useCategoriesData';
import { categoryUpdateSchema } from '@/lib/validators/categoryValidator';
import { useTheme } from 'next-themes';
import { useNotification } from '@/hooks/useNotifications';

type FormValues = z.infer<typeof categoryUpdateSchema>;

interface UpdateCategoryModalProps {
  isOpen: boolean;
  categoryId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UpdateCategoryModal({ 
  isOpen, 
  categoryId, 
  onClose, 
  onSuccess 
}: UpdateCategoryModalProps) {
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
  
  const { data: category, isLoading } = useCategoryDetail(categoryId, isOpen);
  const updateCategoryMutation = useUpdateCategory();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '',
    },
  });
  
  // Preencher o formulário quando os dados da categoria forem carregados
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
      
      if (category.icon) {
        setSelectedEmoji(category.icon);
      }
    }
  }, [category, form]);
  
  const onSubmit = (values: FormValues) => {
    // Adicionar o emoji selecionado ao form
    if (selectedEmoji) {
      values.icon = selectedEmoji;
    }
    
    updateCategoryMutation.mutate(
      { id: categoryId, data: values },
      {
        onSuccess: () => {
          form.reset();
          showSuccess("Categoria atualizada com sucesso!");
          onSuccess?.();
          onClose();
        },
        onError: () => {
          showError("Erro ao atualizar categoria. Tente novamente.");
        }
      }
    );
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
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Editar Categoria</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
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
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={updateCategoryMutation.isPending}
                  className={isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCategoryMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {updateCategoryMutation.isPending ? 'Atualizando...' : 'Atualizar Categoria'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}