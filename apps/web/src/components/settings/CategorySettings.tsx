'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryList } from '@/components/settings/CategoryList';
import { CreateCategoryModal } from '@/components/settings/CreateCategoryModal';
import { UpdateCategoryModal } from '@/components/settings/UpdateCategoryModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCategoriesList, useDeleteCategory } from '@/hooks/useCategoriesData';
import { useTheme } from 'next-themes';
import { useNotification } from '@/hooks/useNotifications';

export function CategorySettings() {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'investment'>('expense');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const isDark = theme === 'dark';
  
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = 
    useCategoriesList(activeTab, true);
  
  const deleteCategoryMutation = useDeleteCategory();
  
  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete, {
        onSuccess: () => {
          setCategoryToDelete(null);
          refetchCategories();
          showSuccess("Categoria excluída com sucesso!");
        },
        onError: () => {
          showError("Erro ao excluir categoria. Ela pode estar sendo usada em transações.");
        }
      });
    }
  };

  return (
    <Card className={`border shadow transition-colors duration-200 
                     ${isDark 
                       ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                       : 'bg-white border-gray-200'}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Categorias</CardTitle>
          <CardDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
            Gerencie as categorias para suas transações
          </CardDescription>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
            <TabsTrigger value="investment">Investimentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income" className="mt-0">
            <CategoryList 
              categories={categories}
              isLoading={categoriesLoading}
              onEdit={setSelectedCategoryId}
              onDelete={setCategoryToDelete}
              type="income"
            />
          </TabsContent>
          
          <TabsContent value="expense" className="mt-0">
            <CategoryList 
              categories={categories}
              isLoading={categoriesLoading} 
              onEdit={setSelectedCategoryId}
              onDelete={setCategoryToDelete}
              type="expense"
            />
          </TabsContent>
          
          <TabsContent value="investment" className="mt-0">
            <CategoryList 
              categories={categories}
              isLoading={categoriesLoading}
              onEdit={setSelectedCategoryId}
              onDelete={setCategoryToDelete}
              type="investment"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Modais */}
      <CreateCategoryModal 
        isOpen={isCreateModalOpen}
        initialType={activeTab}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetchCategories()}
      />
      
      {selectedCategoryId && (
        <UpdateCategoryModal 
          isOpen={!!selectedCategoryId}
          categoryId={selectedCategoryId}
          onClose={() => setSelectedCategoryId(null)}
          onSuccess={() => refetchCategories()}
        />
      )}
      
      {/* Confirmação de exclusão */}
      {categoryToDelete && (
        <ConfirmDialog
          title="Excluir Categoria"
          description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e pode afetar transações existentes."
          triggerButton={<span style={{ display: 'none' }}></span>}
          confirmButton={{
            label: 'Excluir',
            variant: 'destructive',
          }}
          onConfirm={handleDeleteCategory}
        />
      )}
    </Card>
  );
}