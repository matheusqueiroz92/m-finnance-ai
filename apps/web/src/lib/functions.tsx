import { Wallet, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const getAccountIcon = (type: string, isDark: boolean) => {
  switch (type) {
    case "checking":
      return (
        <Wallet
          className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        />
      );
    case "savings":
      return (
        <Wallet
          className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
        />
      );
    case "investment":
      return (
        <TrendingUp
          className={`h-5 w-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
        />
      );
    case "credit":
      return (
        <CreditCard
          className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
        />
      );
    default:
      return (
        <Wallet
          className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        />
      );
  }
};

export const getAccountTypeColor = (type: string, isDark: boolean) => {
  switch (type) {
    case "checking":
      return isDark ? "bg-emerald-500/20" : "bg-emerald-100";
    case "savings":
      return isDark ? "bg-blue-500/20" : "bg-blue-100";
    case "investment":
      return isDark ? "bg-indigo-500/20" : "bg-indigo-100";
    case "credit":
      return isDark ? "bg-purple-500/20" : "bg-purple-100";
    default:
      return isDark ? "bg-emerald-500/20" : "bg-emerald-100";
  }
};

export const getAccountTypeLabel = (type: string, isDark: boolean) => {
  switch (type) {
    case "checking":
      return "Conta Corrente";
    case "savings":
      return "Poupança";
    case "investment":
      return "Conta Investimento";
    case "credit":
      return "Cartão de Crédito";
    default:
      return "Conta";
  }
};


export const transactionTypeIcon = (type: string, isDark: boolean) => {
  switch (type) {
    case "income":
      return (
        <ArrowUpRight
          className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        />
      );
    case "expense":
      return (
        <ArrowDownRight
          className={`h-4 w-4 ${isDark ? "text-red-400" : "text-red-600"}`}
        />
      );
    case "investment":
      return (
        <TrendingUp
          className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}
        />
      );
    default:
      return null;
  }
};

export const transactionTypeLabel = (type: string, isDark: boolean) => {
  switch (type) {
    case "income":
      return "Receita";
    case "expense":
      return "Despesa";
    case "investment":
      return "Investimento";
    default:
      return type;
  }
};

export const getCardBrandLogo = (brand: string) => {
  switch (brand) {
    case "visa":
      return "/images/card-visa.svg";
    case "mastercard":
      return "/images/card-mastercard.svg";
    case "elo":
      return "/images/card-elo.svg";
    case "american_express":
      return "/images/card-amex.svg";
    case "diners":
      return "/images/card-diners.svg";
    case "hipercard":
      return "/images/card-hipercard.svg";
    default:
      return null;
  }
};

export const getCardBrandColor = (brand: string, isDark: boolean) => {
  switch (brand) {
    case "visa":
      return isDark
        ? "from-blue-900 to-blue-700"
        : "from-blue-700 to-blue-500";
    case "mastercard":
      return isDark
        ? "from-red-900 to-orange-700"
        : "from-red-700 to-orange-500";
    case "elo":
      return isDark
        ? "from-purple-900 to-purple-700"
        : "from-purple-700 to-purple-500";
    case "american_express":
      return isDark
        ? "from-emerald-900 to-emerald-700"
        : "from-emerald-700 to-emerald-500";
    case "diners":
      return isDark
        ? "from-indigo-900 to-indigo-700"
        : "from-indigo-700 to-indigo-500";
    case "hipercard":
      return isDark
        ? "from-orange-900 to-red-700"
        : "from-orange-700 to-red-500";
    default:
      return isDark
        ? "from-gray-800 to-gray-700"
        : "from-gray-700 to-gray-500";
  }
};

export const getCardBrandName = (brand: string) => {
  switch (brand) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "elo":
      return "Elo";
    case "american_express":
      return "American Express";
    case "diners":
      return "Diners Club";
    case "hipercard":
      return "Hipercard";
    default:
      return "Cartão";
  }
};

export const formatExpiryDate = (date: string) => {
  return date;
};

export const getDaysUntilDue = (dueDay: number) => {
  const today = new Date();
  const currentDay = today.getDate();

  // Se o dia de vencimento já passou neste mês, considerar o próximo mês
  if (dueDay < currentDay) {
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      dueDay
    );
    const diffTime = nextMonth.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay);
    const diffTime = thisMonth.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};