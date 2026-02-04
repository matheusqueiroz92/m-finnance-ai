"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { transactionCreateSchema } from "@/lib/validators/transactionValidator";
import {
  getTransactionById,
  updateTransaction,
} from "@/services/transactionService";
import { getAccounts } from "@/services/accountService";
import { getCategories } from "@/services/categoryService";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import CurrencyInput from "@/components/shared/CurrencyInput";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { TransactionUpdateData } from "@/types/transaction";

type FormValues = z.input<typeof transactionCreateSchema>;

interface UpdateTransactionModalProps {
  isOpen: boolean;
  transactionId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UpdateTransactionModal({
  isOpen,
  transactionId,
  onClose,
  onSuccess,
}: UpdateTransactionModalProps) {
  const [activeTab, setActiveTab] = useState<
    "income" | "expense" | "investment"
  >("expense");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(transactionCreateSchema),
    defaultValues: {
      account: "",
      category: "",
      amount: 0,
      type: "expense",
      description: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      notes: "",
    },
  });

  const { data: transaction, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION_DETAIL(transactionId ?? "")],
    queryFn: () => getTransactionById(transactionId!),
    enabled: isOpen && !!transactionId,
  });

  const { data: accounts } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: getAccounts,
    enabled: isOpen,
  });

  const { data: categories } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, activeTab],
    queryFn: () => getCategories(activeTab),
    enabled: isOpen,
  });

  useEffect(() => {
    if (transaction) {
      const dateStr =
        typeof transaction.date === "string"
          ? transaction.date.split("T")[0]
          : new Date(transaction.date).toISOString().split("T")[0];
      setActiveTab(transaction.type);
      form.reset({
        account: transaction.account._id,
        category: transaction.category._id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        date: dateStr,
        isRecurring: transaction.isRecurring ?? false,
        recurrenceInterval: transaction.recurrenceInterval,
        notes: transaction.notes ?? "",
      });
    }
  }, [transaction, form]);

  useEffect(() => {
    form.setValue("type", activeTab);
  }, [activeTab, form]);

  const updateTransactionMutation = useMutation({
    mutationFn: (data: {
      formData: TransactionUpdateData;
      files: File[];
      keepExistingAttachments: boolean;
    }) =>
      updateTransaction(
        transactionId!,
        data.formData,
        data.files,
        data.keepExistingAttachments
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY] });
      if (transactionId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.TRANSACTION_DETAIL(transactionId)],
        });
      }
      setSelectedFiles([]);
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: TransactionUpdateData = {
      account: values.account,
      category: values.category,
      amount: values.amount,
      type: values.type,
      description: values.description,
      date: values.date,
      isRecurring: values.isRecurring,
      recurrenceInterval: values.recurrenceInterval,
      notes: values.notes,
    };
    updateTransactionMutation.mutate({
      formData: payload,
      files: selectedFiles,
      keepExistingAttachments: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedFiles([]);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Transação</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "income" | "expense" | "investment")
            }
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger
                value="income"
                className="flex items-center justify-center rounded-full"
              >
                <ArrowUpRight className="h-4 w-4" />
                Receita
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                className="flex items-center justify-center rounded-full"
              >
                <ArrowDownRight className="h-4 w-4" />
                Despesa
              </TabsTrigger>
              <TabsTrigger
                value="investment"
                className="flex items-center justify-center rounded-full"
              >
                <TrendingUp className="h-4 w-4" />
                Investimento
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Supermercado"
                            className="rounded-full placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            className="rounded-full placeholder:text-gray-400"
                            value={field.value ?? 0}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl bg-[#1a2329] text-white">
                            {categories?.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conta</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="Selecione uma conta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl bg-[#1a2329] text-white">
                            {accounts?.map((account) => (
                              <SelectItem key={account._id} value={account._id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="rounded-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-2xl border p-4">
                        <div className="text-xs text-muted-foreground">
                          Transação Recorrente?
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

                {form.watch("isRecurring") && (
                  <FormField
                    control={form.control}
                    name="recurrenceInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo de Recorrência</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="Selecione o intervalo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl bg-[#1a2329] text-white">
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione informações complementares"
                          {...field}
                          className="rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Anexos (novos)</FormLabel>
                  <div className="border-2 border-dashed rounded-2xl p-6 text-center">
                    <Input
                      type="file"
                      id="attachments-edit"
                      className="hidden rounded-2xl"
                      multiple
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="attachments-edit"
                      className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                    >
                      Arraste arquivos ou escolha um arquivo
                      <p className="text-xs mt-1">PDF, PNG ou JPG até 5MB</p>
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">
                        Arquivos selecionados:
                      </p>
                      <ul className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li
                            key={index}
                            className="text-sm flex justify-between items-center"
                          >
                            <span>{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              className="rounded-full"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              &times;
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={updateTransactionMutation.isPending}
                    className="rounded-full"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateTransactionMutation.isPending}
                    className="rounded-full"
                  >
                    {updateTransactionMutation.isPending
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
