import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, Pencil, Trash2, Eye, CreditCard, AlertCircle
} from 'lucide-react';
import { CreditCard as CreditCardType } from '@/types/credit-card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTheme } from 'next-themes';

interface CreditCardListProps {
  creditCards?: CreditCardType[];
  isLoading: boolean;
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  onAddNew: () => void;
  onViewBillings?: (cardId: string) => void;
}

export function CreditCardList({ 
  creditCards, 
  isLoading, 
  onEdit, 
  onDelete, 
  onAddNew,
  onViewBillings 
}: CreditCardListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getCardBrandLogo = (brand: string) => {
    switch (brand) {
      case 'visa':
        return '/images/card-visa.svg';
      case 'mastercard':
        return '/images/card-mastercard.svg';
      case 'elo':
        return '/images/card-elo.svg';
      case 'american_express':
        return '/images/card-amex.svg';
      case 'diners':
        return '/images/card-diners.svg';
      case 'hipercard':
        return '/images/card-hipercard.svg';
      default:
        return null;
    }
  };
  
  const getCardBrandColor = (brand: string) => {
    switch (brand) {
      case 'visa':
        return isDark ? 'from-blue-900 to-blue-700' : 'from-blue-700 to-blue-500';
      case 'mastercard':
        return isDark ? 'from-red-900 to-orange-700' : 'from-red-700 to-orange-500';
      case 'elo':
        return isDark ? 'from-purple-900 to-purple-700' : 'from-purple-700 to-purple-500';
      case 'american_express':
        return isDark ? 'from-emerald-900 to-emerald-700' : 'from-emerald-700 to-emerald-500';
      case 'diners':
        return isDark ? 'from-indigo-900 to-indigo-700' : 'from-indigo-700 to-indigo-500';
      case 'hipercard':
        return isDark ? 'from-orange-900 to-red-700' : 'from-orange-700 to-red-500';
      default:
        return isDark ? 'from-gray-800 to-gray-700' : 'from-gray-700 to-gray-500';
    }
  };
  
  const getCardBrandName = (brand: string) => {
    switch (brand) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'elo':
        return 'Elo';
      case 'american_express':
        return 'American Express';
      case 'diners':
        return 'Diners Club';
      case 'hipercard':
        return 'Hipercard';
      default:
        return 'Cartão';
    }
  };
  
  const formatExpiryDate = (date: string) => {
    return date;
  };
  
  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Se o dia de vencimento já passou neste mês, considerar o próximo mês
    if (dueDay < currentDay) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
      const diffTime = nextMonth.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay);
      const diffTime = thisMonth.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-56"></Card>
        ))}
      </div>
    );
  }

  if (!creditCards || creditCards.length === 0) {
    return (
      <EmptyState 
        title="Nenhum cartão encontrado"
        description="Adicione seu primeiro cartão de crédito para começar a controlar seus gastos."
        icon={<CreditCard className={`h-12 w-12 ${isDark ? 'text-zinc-400' : 'text-gray-400'}`} />}
        actionLabel="Adicionar Cartão"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {creditCards.map((card) => (
        <Card key={card._id} className="overflow-hidden shadow">
          <CardContent className="p-0">
            {/* Parte visual do cartão */}
            <div className={`bg-gradient-to-r ${getCardBrandColor(card.cardBrand)} p-6 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Cartão de Crédito</p>
                  <h3 className="font-semibold text-xl mt-1">{card.cardholderName}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={
                    isDark ? 'bg-[#1a2329] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }>
                    <DropdownMenuLabel className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                    <DropdownMenuItem 
                      onClick={() => onEdit(card._id)}
                      className={`cursor-pointer ${
                        isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'
                      }`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    
                    {onViewBillings && (
                      <DropdownMenuItem 
                        onClick={() => onViewBillings(card._id)}
                        className={`cursor-pointer ${
                          isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-gray-100 focus:bg-gray-100'
                        }`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver faturas
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                    <DropdownMenuItem 
                      onClick={() => onDelete(card._id)}
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
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-xl tracking-widest font-mono">•••• •••• •••• {card.cardNumber}</div>
                <div className="h-8 w-12">
                  {getCardBrandLogo(card.cardBrand) ? (
                    <img 
                      src={getCardBrandLogo(card.cardBrand) || ''} 
                      alt={getCardBrandName(card.cardBrand)} 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm font-medium">{getCardBrandName(card.cardBrand)}</span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-80">Validade</p>
                  <p className="font-medium">{formatExpiryDate(card.expiryDate)}</p>
                </div>
                {card.isActive ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Detalhes do cartão */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Limite Total</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R$ {card.creditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Limite Disponível</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    R$ {card.availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                    Utilização: {Math.round((card.currentBalance / card.creditLimit) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(card.currentBalance / card.creditLimit) * 100} 
                  className={`h-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} 
                />
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Vencimento da Fatura</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Todo dia {card.billingDueDay}
                  </p>
                </div>
                <div className="flex items-center">
                  <AlertCircle className={`h-4 w-4 mr-1 ${
                    getDaysUntilDue(card.billingDueDay) <= 5 
                      ? 'text-red-500' 
                      : 'text-emerald-500'
                  }`} />
                  <span className={`text-sm ${
                    getDaysUntilDue(card.billingDueDay) <= 5 
                      ? (isDark ? 'text-red-400' : 'text-red-600')
                      : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                  }`}>
                    {getDaysUntilDue(card.billingDueDay)} dias para o vencimento
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}