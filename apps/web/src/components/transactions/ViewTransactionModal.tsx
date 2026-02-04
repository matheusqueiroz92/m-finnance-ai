"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTransactionById } from "@/services/transactionService";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Transaction, Attachment } from "@/types/transaction";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/utils";
import { FileText, Calendar, Wallet, Tag, CreditCard } from "lucide-react";

const RECURRENCE_LABELS: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

const TYPE_LABELS: Record<string, string> = {
  income: "Receita",
  expense: "Despesa",
  investment: "Investimento",
};

const ATTACHMENT_TYPE_LABELS: Record<string, string> = {
  receipt: "Recibo",
  invoice: "Fatura",
  contract: "Contrato",
  other: "Outro",
};

interface ViewTransactionModalProps {
  isOpen: boolean;
  transactionId: string | null;
  onClose: () => void;
}

function formatAmount(amount: number, type: string): string {
  const prefix = type === "income" ? "+ " : "- ";
  return `${prefix}R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-200 dark:border-white/10 last:border-0">
      {Icon && (
        <Icon className="h-4 w-4 mt-0.5 text-gray-500 dark:text-zinc-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ViewTransactionModal({
  isOpen,
  transactionId,
  onClose,
}: ViewTransactionModalProps) {
  const { data: transaction, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION_DETAIL(transactionId ?? "")],
    queryFn: () => getTransactionById(transactionId!),
    enabled: isOpen && !!transactionId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes da Transação</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500 dark:text-zinc-400">
            Carregando...
          </div>
        ) : transaction ? (
          <div className="space-y-1 mt-2">
            <DetailRow
              label="Data"
              value={format(parseLocalDate(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              icon={Calendar}
            />
            <DetailRow
              label="Descrição"
              value={transaction.description}
            />
            <DetailRow
              label="Tipo"
              value={
                <StatusBadge
                  variant={transaction.type as "income" | "expense" | "investment"}
                  label={TYPE_LABELS[transaction.type]}
                >
                  {TYPE_LABELS[transaction.type]}
                </StatusBadge>
              }
              icon={Tag}
            />
            <DetailRow
              label="Valor"
              value={
                <span
                  className={
                    transaction.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </span>
              }
            />
            <DetailRow
              label="Conta"
              value={transaction.account.name}
              icon={Wallet}
            />
            <DetailRow
              label="Categoria"
              value={transaction.category.name}
              icon={Tag}
            />
            {transaction.creditCard && (
              <DetailRow
                label="Cartão de Crédito"
                value={transaction.creditCard.cardholderName}
                icon={CreditCard}
              />
            )}
            <DetailRow
              label="Recorrente"
              value={transaction.isRecurring ? "Sim" : "Não"}
            />
            {transaction.isRecurring && transaction.recurrenceInterval && (
              <DetailRow
                label="Intervalo"
                value={RECURRENCE_LABELS[transaction.recurrenceInterval] ?? transaction.recurrenceInterval}
              />
            )}
            {transaction.notes && (
              <DetailRow label="Observações" value={transaction.notes} />
            )}
            {transaction.attachments && transaction.attachments.length > 0 && (
              <div className="flex items-start gap-3 py-2 border-b border-gray-200 dark:border-white/10 last:border-0">
                <FileText className="h-4 w-4 mt-0.5 text-gray-500 dark:text-zinc-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                    Anexos
                  </p>
                  <ul className="mt-1 space-y-1">
                    {transaction.attachments.map((att: Attachment) => (
                      <li
                        key={att._id}
                        className="text-sm text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        {ATTACHMENT_TYPE_LABELS[att.type] ?? att.type}
                        {att.description && ` - ${att.description}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
