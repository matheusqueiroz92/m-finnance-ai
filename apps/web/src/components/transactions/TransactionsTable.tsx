// src/components/transactions/TransactionsTable.tsx
"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";
import { parseLocalDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Transaction, TransactionListResponse } from "@/types/transaction";
import { useTheme } from "next-themes";

interface TransactionsTableProps {
  data?: TransactionListResponse;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onView: (transaction: Transaction) => void;
}

export function TransactionsTable({
  data,
  isLoading,
  onPageChange,
  onEdit,
  onDelete,
  onView,
}: TransactionsTableProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const columns = useMemo<ColumnDef<Transaction, unknown>[]>(
    () => [
      {
        accessorKey: "date",
        header: () => (
          <span className={isDark ? "text-zinc-300" : "text-gray-700"}>
            Data
          </span>
        ),
        cell: ({ row }) => (
          <span className={isDark ? "text-white" : "text-gray-900"}>
            {format(parseLocalDate(row.original.date), "dd MMM yyyy", {
              locale: ptBR,
            })}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: () => (
          <span className={isDark ? "text-zinc-300" : "text-gray-700"}>
            Descrição
          </span>
        ),
        cell: ({ row }) => (
          <div>
            <div
              className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {row.original.description}
            </div>
            <div
              className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}
            >
              {row.original.account.name}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: () => (
          <span className={isDark ? "text-zinc-300" : "text-gray-700"}>
            Categoria
          </span>
        ),
        cell: ({ row }) => (
          <span className={isDark ? "text-white" : "text-gray-900"}>
            {row.original.category.name}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: () => (
          <span className={isDark ? "text-zinc-300" : "text-gray-700"}>
            Tipo
          </span>
        ),
        cell: ({ row }) => (
          <StatusBadge
            variant={row.original.type as "income" | "expense" | "investment"}
            label={row.original.type === "income" ? "Receita" : row.original.type === "expense" ? "Despesa" : "Investimento" as string}
          >
            {row.original.type === "income" ? "Receita" : row.original.type === "expense" ? "Despesa" : "Investimento" as string }
          </StatusBadge>
        ),
      },
      {
        accessorKey: "amount",
        header: () => (
          <span className={isDark ? "text-zinc-300" : "text-gray-700"}>
            Valor
          </span>
        ),
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <span
              className={
                transaction.type === "income"
                  ? isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
                  : isDark
                    ? "text-red-400"
                    : "text-red-600"
              }
            >
              {transaction.type === "income" ? "+ " : "- "}
              R${" "}
              {transaction.amount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span
            className={`text-right ${isDark ? "text-zinc-300" : "text-gray-700"}`}
          >
            Ações
          </span>
        ),
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={
                    isDark
                      ? "border-white/10 bg-[#1a2329] text-white"
                      : "border-gray-200 bg-white text-gray-900"
                  }
                >
                  <DropdownMenuItem
                    className={
                      isDark
                        ? "cursor-pointer focus:bg-white/10 hover:bg-white/10"
                        : "cursor-pointer focus:bg-gray-100 hover:bg-gray-100"
                    }
                    onClick={() => onView(transaction)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={
                      isDark
                        ? "cursor-pointer focus:bg-white/10 hover:bg-white/10"
                        : "cursor-pointer focus:bg-gray-100 hover:bg-gray-100"
                    }
                    onClick={() => onEdit(transaction)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`cursor-pointer text-red-600 dark:text-red-400 ${
                      isDark
                        ? "focus:bg-red-600/10 hover:bg-red-600/10"
                        : "focus:bg-red-100 hover:bg-red-100"
                    }`}
                    onClick={() => onDelete(transaction._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [isDark, onEdit, onDelete, onView]
  );

  const transactions = data?.transactions ?? [];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      isLoading={isLoading}
      emptyMessage="Nenhuma transação encontrada"
      theme={theme}
      className={
        isDark
          ? "border-white/20 bg-white/10 shadow backdrop-blur-sm"
          : "border-gray-200 bg-white"
      }
    >
      {/* Paginação */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between px-6 py-4">
          <div
            className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}
          >
            Mostrando {1 + (data.page - 1) * data.limit}-
            {Math.min(data.page * data.limit, data.total)} de {data.total}{" "}
            resultados
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page === 1}
              className={
                isDark ? "border-white/20 text-white hover:bg-white/10" : ""
              }
            >
              Anterior
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={i}
                    variant={pageNumber === data.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNumber)}
                    className={`h-8 w-8 p-0 ${
                      pageNumber === data.page
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : isDark
                          ? "border-white/20 text-white hover:bg-white/10"
                          : ""
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {data.pages > 5 && (
                <>
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    ...
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(data.pages)}
                    className={`h-8 w-8 p-0 ${
                      isDark
                        ? "border-white/20 text-white hover:bg-white/10"
                        : ""
                    }`}
                  >
                    {data.pages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page + 1)}
              disabled={data.page === data.pages}
              className={
                isDark ? "border-white/20 text-white hover:bg-white/10" : ""
              }
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </DataTable>
  );
}
