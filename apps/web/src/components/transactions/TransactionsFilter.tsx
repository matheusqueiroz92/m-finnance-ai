import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { transactionFilterSchema } from "@/lib/validators/transactionValidator";
import { useTheme } from "next-themes";
import { TransactionFilters } from "@/types/transaction";
import { Category } from "@/types/category";
import { Account } from "@/types/account";

interface TransactionsFilterProps {
  onFilter: (filters: TransactionFilters) => void;
  onReset: () => void;
  categories?: Category[];
  accounts?: Account[];
  isLoading: boolean;
}

export function TransactionsFilter({
  onFilter,
  onReset,
  categories,
  accounts,
  isLoading,
}: TransactionsFilterProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const form = useForm({
    resolver: zodResolver(transactionFilterSchema),
    defaultValues: {
      type: undefined,
      category: undefined,
      account: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      limit: 10,
    },
  });

  const handleFilter = (values: any) => {
    // Limpar valores "all"
    const filters = { ...values };

    if (filters.type === "all") filters.type = undefined;
    if (filters.category === "all") filters.category = undefined;
    if (filters.account === "all") filters.account = undefined;

    onFilter(filters);
  };

  return (
    <Card
      className={`border shadow transition-colors duration-200 rounded-2xl
                  ${
                    isDark
                      ? "bg-white/10 backdrop-blur-sm border-white/20"
                      : "bg-white border-gray-200"
                  }`}
    >
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFilter)}
            className="flex flex-col sm:flex-row items-end gap-4 flex-wrap"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full sm:w-auto">
                  <FormLabel
                    className={isDark ? "text-zinc-300" : "text-gray-700"}
                  >
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "all"}
                    >
                      <SelectTrigger
                        className={`w-full sm:w-32 rounded-2xl ${
                          isDark
                            ? "bg-primary border-white/20 text-white rounded-2xl"
                            : "bg-white border-gray-200 text-gray-900 rounded-2xl"
                        }`}
                      >
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent
                        className={
                          isDark
                            ? "bg-[#1a2329] border-white/20 text-white rounded-2xl"
                            : "bg-white border-gray-200 text-gray-900 rounded-2xl"
                        }
                      >
                        <SelectItem
                          value="all"
                          className={isDark ? "text-white" : "text-gray-900"}
                        >
                          Todas
                        </SelectItem>
                        <SelectItem
                          value="income"
                          className={isDark ? "text-white" : "text-gray-900"}
                        >
                          Receita
                        </SelectItem>
                        <SelectItem
                          value="expense"
                          className={isDark ? "text-white" : "text-gray-900"}
                        >
                          Despesa
                        </SelectItem>
                        <SelectItem
                          value="investment"
                          className={isDark ? "text-white" : "text-gray-900"}
                        >
                          Investimento
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Outros campos de formulário semelhantes para category e account */}

            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl"
                disabled={isLoading}
              >
                Filtrar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReset}
                className={
                  isDark ? "border-white/20 text-white hover:bg-white/10 rounded-2xl" : ""
                }
                disabled={isLoading}
              >
                Limpar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
