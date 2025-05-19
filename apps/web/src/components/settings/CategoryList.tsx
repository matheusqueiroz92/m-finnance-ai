import React from 'react';
import { Category } from '@/types/category';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Pencil, Trash2, Plus, Tag } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTheme } from 'next-themes';

interface CategoryListProps {
  categories?: Category[];
  isLoading: boolean;
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
  type: 'income' | 'expense' | 'investment';
}

export function CategoryList({ categories, isLoading, onEdit, onDelete, type }: CategoryListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getCategoryTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'investment':
        return 'Investimento';
      default:
        return type;
    }
  };
  
  const getTypeVariant = (type: string): any => {
    switch (type) {
      case 'income':
        return 'income';
      case 'expense':
        return 'expense';
      case 'investment':
        return 'investment';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-10 animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <EmptyState 
        title={`Nenhuma categoria de ${getCategoryTypeLabel(type).toLowerCase()} encontrada`}
        description="Crie categorias para organizar suas transações"
        icon={<Tag className={`h-12 w-12 ${isDark ? 'text-zinc-400' : 'text-gray-400'}`} />}
        actionLabel="Criar Categoria"
        onAction={() => {
          // Deixamos o botão de adicionar na parte superior do componente CategorySettings
        }}
      />
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className={isDark ? 'border-white/10 hover:bg-white/5' : 'hover:bg-gray-100'}>
            <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Nome</TableHead>
            <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Tipo</TableHead>
            <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Padrão</TableHead>
            <TableHead className={`text-right ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow 
              key={category._id} 
              className={isDark ? 'border-white/10 hover:bg-white/5' : 'hover:bg-gray-100'}
            >
              <TableCell className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {category.icon && (
                  <span className="mr-2">{category.icon}</span>
                )}
                {category.name}
              </TableCell>
              <TableCell>
                <StatusBadge 
                  variant={getTypeVariant(category.type)}
                  label={getCategoryTypeLabel(category.type)}
                />
              </TableCell>
              <TableCell>
                {category.isDefault ? (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    Padrão
                  </span>
                ) : (
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                    Não
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(category._id)}
                    className={isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  {!category.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(category._id)}
                      className={`text-red-500 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-100'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}