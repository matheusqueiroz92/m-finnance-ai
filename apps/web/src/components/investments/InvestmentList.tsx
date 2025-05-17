import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  TrendingUp, MoreVertical, Pencil, Trash2, Eye, Plus,
  DollarSign, LineChart, BarChart3, Building, Coins
} from 'lucide-react';
import { Investment } from '@/types/investment';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTheme } from 'next-themes';

interface InvestmentListProps {
  investments?: Investment[];
  isLoading: boolean;
  onEdit: (investmentId: string) => void;
  onDelete: (investmentId: string) => void;
  onAddNew: () => void;
  onViewDetails?: (investmentId: string) => void;
}

export function InvestmentList({ 
  investments, 
  isLoading, 
  onEdit, 
  onDelete, 
  onAddNew,
  onViewDetails 
}: InvestmentListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getInvestmentIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <LineChart className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />;
      case 'bond':
        return <Building className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'fund':
        return <BarChart3 className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />;
      case 'crypto':
        return <Coins className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />;
      case 'cash':
        return <DollarSign className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />;
      default:
        return <TrendingUp className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />;
    }
  };
  
  const getInvestmentTypeColor = (type: string) => {
    switch (type) {
      case 'stock':
        return isDark ? 'bg-blue-500/20' : 'bg-blue-100';
      case 'bond':
        return isDark ? 'bg-emerald-500/20' : 'bg-emerald-100';
      case 'fund':
        return isDark ? 'bg-purple-500/20' : 'bg-purple-100';
      case 'crypto':
        return isDark ? 'bg-amber-500/20' : 'bg-amber-100';
      case 'cash':
        return isDark ? 'bg-green-500/20' : 'bg-green-100';
      default:
        return isDark ? 'bg-blue-500/20' : 'bg-blue-100';
    }
  };
  
  const getInvestmentTypeLabel = (type: string) => {
    switch (type) {
      case 'stock':
        return 'Ação';
      case 'bond':
        return 'Título';
      case 'fund':
        return 'Fundo';
      case 'crypto':
        return 'Criptomoeda';
      case 'cash':
        return 'Reserva';
      default:
        return 'Investimento';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48"></Card>
        ))}
      </div>
    );
  }

  if (!investments || investments.length === 0) {
    return (
      <EmptyState 
        title="Nenhum investimento encontrado"
        description="Adicione um novo investimento para começar a acompanhar sua carteira."
        icon={<TrendingUp className={`h-12 w-12 ${isDark ? 'text-zinc-400' : 'text-gray-400'}`} />}
        actionLabel="Adicionar Investimento"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {investments.map((investment) => (
        <Card key={investment._id} className={`overflow-hidden border shadow transition-colors duration-200 
                        ${isDark 
                          ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                          : 'bg-white border-gray-200'}`}>
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full ${getInvestmentTypeColor(investment.type)} 
                                   flex items-center justify-center mr-4`}>
                    {getInvestmentIcon(investment.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {investment.name}
                      </h3>
                      <Badge variant="outline" className={`text-xs ${isDark ? 'border-white/20 text-white' : ''}`}>
                        {investment.ticker || getInvestmentTypeLabel(investment.type)}
                      </Badge>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                      {investment.institution}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={
                    isDark ? 'bg-[#1a2329] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }>
                    <DropdownMenuLabel className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                    <DropdownMenuItem 
                      onClick={() => onEdit(investment._id)}
                      className={`cursor-pointer ${
                        isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'
                      }`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    
                    {onViewDetails && (
                      <DropdownMenuItem 
                        onClick={() => onViewDetails(investment._id)}
                        className={`cursor-pointer ${
                          isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'
                        }`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                    <DropdownMenuItem 
                      onClick={() => onDelete(investment._id)}
                      className={`cursor-pointer text-red-600 dark:text-red-400 ${
                        isDark ? 'hover:bg-red-600/10 focus:bg-red-600/10' : 'hover:bg-red-100 focus:bg-red-100'
                      }`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Valor Atual</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R$ {investment.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Valor Investido</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R$ {investment.investedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Rentabilidade</p>
                  <p className={`font-medium ${
                    investment.profitability >= 0 
                      ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                      : (isDark ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {investment.profitability >= 0 ? '+' : ''}
                    {investment.profitability.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Retorno</p>
                  <p className={`font-medium ${
                    (investment.currentValue - investment.investedValue) >= 0 
                      ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                      : (isDark ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {(investment.currentValue - investment.investedValue) >= 0 ? '+' : ''}
                    R$ {(investment.currentValue - investment.investedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}