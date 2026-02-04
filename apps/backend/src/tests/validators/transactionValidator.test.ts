import {
  transactionCreateSchema,
  transactionUpdateSchema,
  transactionFilterSchema,
} from "../../validators/transactionValidator";

describe("Transaction Validator", () => {
  describe("transactionCreateSchema", () => {
    it("should validate valid transaction creation data", () => {
      const validData = {
        account: "account-id",
        category: "category-id",
        amount: 100.5,
        type: "expense" as const,
        description: "Compra no supermercado",
        date: "2024-01-15",
        isRecurring: false,
        notes: "Compras da semana",
      };

      const result = transactionCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(100.5);
        expect(result.data.type).toBe("expense");
        expect(result.data.isRecurring).toBe(false);
      }
    });

    it("should validate all transaction types", () => {
      const transactionTypes = ["income", "expense"];

      transactionTypes.forEach((type) => {
        const data = {
          account: "account-id",
          category: "category-id",
          amount: 100,
          type,
          description: `Test ${type}`,
        };

        const result = transactionCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      // Test investment type separately with required investment field
      const investmentData = {
        account: "account-id",
        category: "category-id",
        investment: "investment-id",
        amount: 100,
        type: "investment" as const,
        description: "Test investment",
      };

      const investmentResult =
        transactionCreateSchema.safeParse(investmentData);
      expect(investmentResult.success).toBe(true);
    });

    it("should apply default values", () => {
      const dataWithoutDefaults = {
        account: "account-id",
        category: "category-id",
        amount: 100,
        type: "expense" as const,
        description: "Test transaction",
      };

      const result = transactionCreateSchema.safeParse(dataWithoutDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isRecurring).toBe(false);
        expect(result.data.date).toBeInstanceOf(Date);
      }
    });

    it("should validate recurring transaction with interval", () => {
      const recurringData = {
        account: "account-id",
        category: "category-id",
        amount: 50,
        type: "expense" as const,
        description: "Assinatura mensal",
        isRecurring: true,
        recurrenceInterval: "monthly" as const,
      };

      const result = transactionCreateSchema.safeParse(recurringData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isRecurring).toBe(true);
        expect(result.data.recurrenceInterval).toBe("monthly");
      }
    });

    it("should validate investment transaction with investment field", () => {
      const investmentData = {
        account: "account-id",
        category: "category-id",
        investment: "investment-id",
        amount: 1000,
        type: "investment" as const,
        description: "Compra de ações",
      };

      const result = transactionCreateSchema.safeParse(investmentData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("investment");
        expect(result.data.investment).toBe("investment-id");
      }
    });

    it("should reject recurring transaction without interval", () => {
      const invalidData = {
        account: "account-id",
        category: "category-id",
        amount: 50,
        type: "expense" as const,
        description: "Test transaction",
        isRecurring: true,
        // Missing recurrenceInterval
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Intervalo de recorrência é obrigatório"
        );
      }
    });

    it("should reject investment transaction without investment field", () => {
      const invalidData = {
        account: "account-id",
        category: "category-id",
        amount: 1000,
        type: "investment" as const,
        description: "Investimento sem ID",
        // Missing investment field
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "ID do investimento é obrigatório"
        );
      }
    });

    it("should reject invalid transaction type", () => {
      const invalidData = {
        account: "account-id",
        category: "category-id",
        amount: 100,
        type: "invalid_type" as any,
        description: "Test transaction",
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Tipo inválido");
      }
    });

    it("should reject negative amount", () => {
      const invalidData = {
        account: "account-id",
        category: "category-id",
        amount: -100,
        type: "expense" as const,
        description: "Test transaction",
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject zero amount", () => {
      const invalidData = {
        account: "account-id",
        category: "category-id",
        amount: 0,
        type: "expense" as const,
        description: "Test transaction",
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject empty account", () => {
      const invalidData = {
        account: "",
        category: "category-id",
        amount: 100,
        type: "expense" as const,
        description: "Test transaction",
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Conta é obrigatória");
      }
    });

    it("should reject empty category", () => {
      const invalidData = {
        account: "account-id",
        category: "",
        amount: 100,
        type: "expense" as const,
        description: "Test transaction",
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Categoria é obrigatória"
        );
      }
    });

    it("should reject empty description", () => {
      const invalidData = {
        account: "account-id",
        category: "category-id",
        amount: 100,
        type: "expense" as const,
        description: "",
      };

      const result = transactionCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Descrição é obrigatória"
        );
      }
    });

    it("should accept optional fields", () => {
      const dataWithOptionals = {
        account: "account-id",
        category: "category-id",
        amount: 100,
        type: "expense" as const,
        description: "Test transaction",
        creditCard: "credit-card-id",
        notes: "Optional notes",
        fileType: "pdf",
        fileDescription: "Receipt",
      };

      const result = transactionCreateSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.creditCard).toBe("credit-card-id");
        expect(result.data.notes).toBe("Optional notes");
      }
    });

    it("should validate all recurrence intervals", () => {
      const intervals = ["daily", "weekly", "monthly", "yearly"];

      intervals.forEach((interval) => {
        const data = {
          account: "account-id",
          category: "category-id",
          amount: 50,
          type: "expense" as const,
          description: "Recurring transaction",
          isRecurring: true,
          recurrenceInterval: interval,
        };

        const result = transactionCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("transactionUpdateSchema", () => {
    it("should validate valid transaction update data", () => {
      const validData = {
        amount: 150.75,
        type: "income" as const,
        description: "Updated description",
        isRecurring: true,
        recurrenceInterval: "weekly" as const,
      };

      const result = transactionUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(150.75);
        expect(result.data.type).toBe("income");
        expect(result.data.isRecurring).toBe(true);
      }
    });

    it("should accept partial update data", () => {
      const partialData = {
        amount: 200,
        description: "Updated description only",
      };

      const result = transactionUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(200);
        expect(result.data.description).toBe("Updated description only");
      }
    });

    it("should accept empty update object", () => {
      const emptyData = {};

      const result = transactionUpdateSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should validate investment update with investment field", () => {
      const investmentData = {
        type: "investment" as const,
        investment: "investment-id",
        amount: 2000,
        description: "Updated investment",
      };

      const result = transactionUpdateSchema.safeParse(investmentData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("investment");
        expect(result.data.investment).toBe("investment-id");
      }
    });

    it("should reject recurring update without interval", () => {
      const invalidData = {
        isRecurring: true,
        // Missing recurrenceInterval
      };

      const result = transactionUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Intervalo de recorrência é obrigatório"
        );
      }
    });

    it("should reject investment update without investment field", () => {
      const invalidData = {
        type: "investment" as const,
        amount: 2000,
        // Missing investment field
      };

      const result = transactionUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "ID do investimento é obrigatório"
        );
      }
    });

    it("should reject negative amount in update", () => {
      const invalidData = {
        amount: -50,
      };

      const result = transactionUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject invalid transaction type in update", () => {
      const invalidData = {
        type: "invalid_type" as any,
      };

      const result = transactionUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Tipo inválido");
      }
    });
  });

  describe("transactionFilterSchema", () => {
    it("should validate valid filter data", () => {
      const validData = {
        type: "expense" as const,
        category: "category-id",
        account: "account-id",
        investment: "investment-id",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        page: "1",
        limit: "20",
      };

      const result = transactionFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("expense");
        expect(result.data.category).toBe("category-id");
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should apply default values for page and limit", () => {
      const dataWithoutDefaults = {
        type: "income" as const,
      };

      const result = transactionFilterSchema.safeParse(dataWithoutDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should transform date strings to Date objects", () => {
      const dataWithDates = {
        startDate: "2024-06-01",
        endDate: "2024-06-30",
      };

      const result = transactionFilterSchema.safeParse(dataWithDates);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
        expect(result.data.startDate?.getFullYear()).toBe(2024);
        expect(result.data.startDate?.getMonth()).toBe(4); // June is month 4 (0-indexed) due to UTC conversion
      }
    });

    it("should transform string numbers to integers", () => {
      const dataWithStringNumbers = {
        page: "5",
        limit: "25",
      };

      const result = transactionFilterSchema.safeParse(dataWithStringNumbers);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(25);
      }
    });

    it("should accept empty filter object", () => {
      const emptyData = {};

      const result = transactionFilterSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should validate all transaction types in filter", () => {
      const transactionTypes = ["income", "expense", "investment"];

      transactionTypes.forEach((type) => {
        const data = {
          type,
        };

        const result = transactionFilterSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should handle undefined date values", () => {
      const dataWithUndefinedDates = {
        startDate: undefined,
        endDate: undefined,
      };

      const result = transactionFilterSchema.safeParse(dataWithUndefinedDates);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeUndefined();
        expect(result.data.endDate).toBeUndefined();
      }
    });

    it("should handle undefined page and limit values", () => {
      const dataWithUndefinedNumbers = {
        page: undefined,
        limit: undefined,
      };

      const result = transactionFilterSchema.safeParse(
        dataWithUndefinedNumbers
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1); // Default value
        expect(result.data.limit).toBe(10); // Default value
      }
    });
  });

  describe("Type inference", () => {
    it("should correctly infer TransactionCreateInput type", () => {
      const validData: Parameters<typeof transactionCreateSchema.parse>[0] = {
        account: "account-id",
        category: "category-id",
        amount: 100,
        type: "expense",
        description: "Test transaction",
      };

      expect(validData.account).toBe("account-id");
      expect(validData.type).toBe("expense");
      expect(validData.amount).toBe(100);
    });

    it("should correctly infer TransactionUpdateInput type", () => {
      const validData: Parameters<typeof transactionUpdateSchema.parse>[0] = {
        amount: 150,
        description: "Updated description",
      };

      expect(validData.amount).toBe(150);
      expect(validData.description).toBe("Updated description");
    });

    it("should correctly infer TransactionFilterInput type", () => {
      const validData: Parameters<typeof transactionFilterSchema.parse>[0] = {
        type: "expense",
        page: "2",
        limit: "15",
      };

      expect(validData.type).toBe("expense");
      expect(validData.page).toBe("2");
      expect(validData.limit).toBe("15");
    });
  });
});
