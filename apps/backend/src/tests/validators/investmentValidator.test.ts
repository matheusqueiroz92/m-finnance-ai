import {
  investmentCreateSchema,
  investmentUpdateSchema,
  investmentFilterSchema,
} from "../../validators/investmentValidator";

describe("Investment Validator", () => {
  describe("investmentCreateSchema", () => {
    it("should validate valid investment creation data", () => {
      const validData = {
        name: "Ações da Apple",
        type: "stock" as const,
        symbol: "AAPL",
        amount: 10,
        initialValue: 1500,
        currentValue: 1650,
        acquisitionDate: "2024-01-15",
        notes: "Investimento em ações da Apple",
        provider: "Corretora XYZ",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Ações da Apple");
        expect(result.data.type).toBe("stock");
        expect(result.data.symbol).toBe("AAPL");
        expect(result.data.amount).toBe(10);
        expect(result.data.acquisitionDate).toBeInstanceOf(Date);
      }
    });

    it("should validate all investment types", () => {
      const investmentTypes = [
        "stock",
        "bond",
        "mutualFund",
        "etf",
        "cryptocurrency",
        "savings",
        "realEstate",
        "pension",
        "other",
      ];

      investmentTypes.forEach((type) => {
        const data = {
          name: `Investimento ${type}`,
          type,
          amount: 100,
          initialValue: 1000,
          currentValue: 1100,
          acquisitionDate: "2024-01-01",
          account: "account-id",
        };

        const result = investmentCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should transform acquisition date string to Date", () => {
      const dataWithDate = {
        name: "Investimento com Data",
        type: "stock" as const,
        amount: 50,
        initialValue: 5000,
        currentValue: 5500,
        acquisitionDate: "2024-06-15",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(dataWithDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.acquisitionDate).toBeInstanceOf(Date);
        expect(result.data.acquisitionDate?.getFullYear()).toBe(2024);
        expect(result.data.acquisitionDate?.getMonth()).toBe(5); // June is month 5 (0-indexed)
      }
    });

    it("should accept optional fields", () => {
      const dataWithOptionals = {
        name: "Investimento Completo",
        type: "etf" as const,
        symbol: "VTI",
        amount: 25,
        initialValue: 2500,
        currentValue: 2750,
        acquisitionDate: "2024-03-01",
        notes: "ETF de índice total do mercado",
        provider: "Corretora ABC",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.symbol).toBe("VTI");
        expect(result.data.notes).toBe("ETF de índice total do mercado");
        expect(result.data.provider).toBe("Corretora ABC");
      }
    });

    it("should reject short investment name", () => {
      const invalidData = {
        name: "A",
        type: "stock" as const,
        amount: 10,
        initialValue: 1000,
        currentValue: 1100,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject invalid investment type", () => {
      const invalidData = {
        name: "Investimento Inválido",
        type: "invalid_type" as any,
        amount: 10,
        initialValue: 1000,
        currentValue: 1100,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Tipo inválido de investimento"
        );
      }
    });

    it("should reject zero amount", () => {
      const invalidData = {
        name: "Investimento Zero",
        type: "stock" as const,
        amount: 0,
        initialValue: 1000,
        currentValue: 1100,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject negative amount", () => {
      const invalidData = {
        name: "Investimento Negativo",
        type: "stock" as const,
        amount: -5,
        initialValue: 1000,
        currentValue: 1100,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject negative initial value", () => {
      const invalidData = {
        name: "Investimento Valor Inicial Negativo",
        type: "stock" as const,
        amount: 10,
        initialValue: -1000,
        currentValue: 1100,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "não pode ser negativo"
        );
      }
    });

    it("should reject negative current value", () => {
      const invalidData = {
        name: "Investimento Valor Atual Negativo",
        type: "stock" as const,
        amount: 10,
        initialValue: 1000,
        currentValue: -1100,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "não pode ser negativo"
        );
      }
    });

    it("should accept zero initial value", () => {
      const validData = {
        name: "Investimento Valor Zero",
        type: "savings" as const,
        amount: 100,
        initialValue: 0,
        currentValue: 50,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.initialValue).toBe(0);
      }
    });

    it("should accept zero current value", () => {
      const validData = {
        name: "Investimento Atual Zero",
        type: "savings" as const,
        amount: 100,
        initialValue: 1000,
        currentValue: 0,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      const result = investmentCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentValue).toBe(0);
      }
    });

    it("should reject empty account", () => {
      const invalidData = {
        name: "Investimento sem Conta",
        type: "stock" as const,
        amount: 10,
        initialValue: 1000,
        currentValue: 1100,
        acquisitionDate: "2024-01-01",
        account: "",
      };

      const result = investmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Conta é obrigatória");
      }
    });
  });

  describe("investmentUpdateSchema", () => {
    it("should validate valid investment update data", () => {
      const validData = {
        name: "Ações da Apple Atualizadas",
        type: "stock" as const,
        symbol: "AAPL",
        amount: 15,
        currentValue: 2000,
        notes: "Investimento atualizado",
        isActive: true,
        provider: "Nova Corretora",
      };

      const result = investmentUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Ações da Apple Atualizadas");
        expect(result.data.type).toBe("stock");
        expect(result.data.amount).toBe(15);
        expect(result.data.isActive).toBe(true);
      }
    });

    it("should accept partial update data", () => {
      const partialData = {
        name: "Novo Nome do Investimento",
        currentValue: 1500,
        isActive: false,
      };

      const result = investmentUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Novo Nome do Investimento");
        expect(result.data.currentValue).toBe(1500);
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should accept empty update object", () => {
      const emptyData = {};

      const result = investmentUpdateSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should validate all investment types in update", () => {
      const investmentTypes = ["bond", "mutualFund", "etf", "cryptocurrency"];

      investmentTypes.forEach((type) => {
        const data = {
          type,
        };

        const result = investmentUpdateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid investment type in update", () => {
      const invalidData = {
        type: "invalid_type" as any,
      };

      const result = investmentUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Tipo inválido de investimento"
        );
      }
    });

    it("should reject zero amount in update", () => {
      const invalidData = {
        amount: 0,
      };

      const result = investmentUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject negative amount in update", () => {
      const invalidData = {
        amount: -10,
      };

      const result = investmentUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject negative current value in update", () => {
      const invalidData = {
        currentValue: -500,
      };

      const result = investmentUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "não pode ser negativo"
        );
      }
    });

    it("should accept zero current value in update", () => {
      const validData = {
        currentValue: 0,
      };

      const result = investmentUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentValue).toBe(0);
      }
    });

    it("should validate boolean isActive field", () => {
      const dataWithBoolean = {
        isActive: true,
      };

      const result = investmentUpdateSchema.safeParse(dataWithBoolean);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });
  });

  describe("investmentFilterSchema", () => {
    it("should validate valid filter data", () => {
      const validData = {
        type: "stock" as const,
        isActive: "true",
        account: "account-id",
        page: "2",
        limit: "20",
      };

      const result = investmentFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("stock");
        expect(result.data.isActive).toBe(true);
        expect(result.data.account).toBe("account-id");
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should apply default values for page and limit", () => {
      const dataWithoutDefaults = {
        type: "etf" as const,
      };

      const result = investmentFilterSchema.safeParse(dataWithoutDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should transform boolean string to boolean", () => {
      const dataWithBoolean = {
        isActive: "false",
      };

      const result = investmentFilterSchema.safeParse(dataWithBoolean);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should transform string numbers to integers", () => {
      const dataWithStringNumbers = {
        page: "3",
        limit: "25",
      };

      const result = investmentFilterSchema.safeParse(dataWithStringNumbers);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(25);
      }
    });

    it("should accept empty filter object", () => {
      const emptyData = {};

      const result = investmentFilterSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should validate all investment types in filter", () => {
      const investmentTypes = [
        "stock",
        "bond",
        "mutualFund",
        "etf",
        "cryptocurrency",
        "savings",
        "realEstate",
        "pension",
        "other",
      ];

      investmentTypes.forEach((type) => {
        const data = {
          type,
        };

        const result = investmentFilterSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should handle undefined values", () => {
      const dataWithUndefined = {
        type: undefined,
        isActive: undefined,
        account: undefined,
        page: undefined,
        limit: undefined,
      };

      const result = investmentFilterSchema.safeParse(dataWithUndefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBeUndefined();
        expect(result.data.isActive).toBe(false); // Empty string becomes false
        expect(result.data.account).toBeUndefined();
        expect(result.data.page).toBe(1); // Default value
        expect(result.data.limit).toBe(10); // Default value
      }
    });

    it("should handle empty string values", () => {
      const dataWithEmptyStrings = {
        isActive: "",
        page: "",
        limit: "",
      };

      const result = investmentFilterSchema.safeParse(dataWithEmptyStrings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false); // Empty string becomes false
        expect(result.data.page).toBe(1); // Default value for empty string
        expect(result.data.limit).toBe(10); // Default value for empty string
      }
    });
  });

  describe("Type inference", () => {
    it("should correctly infer InvestmentCreateInput type", () => {
      const validData: Parameters<typeof investmentCreateSchema.parse>[0] = {
        name: "Investimento Teste",
        type: "stock",
        amount: 10,
        initialValue: 1000,
        currentValue: 1100,
        acquisitionDate: "2024-01-01",
        account: "account-id",
      };

      expect(validData.name).toBe("Investimento Teste");
      expect(validData.type).toBe("stock");
      expect(validData.amount).toBe(10);
    });

    it("should correctly infer InvestmentUpdateInput type", () => {
      const validData: Parameters<typeof investmentUpdateSchema.parse>[0] = {
        name: "Investimento Atualizado",
        currentValue: 1500,
        isActive: true,
      };

      expect(validData.name).toBe("Investimento Atualizado");
      expect(validData.currentValue).toBe(1500);
      expect(validData.isActive).toBe(true);
    });

    it("should correctly infer InvestmentFilterInput type", () => {
      const validData: Parameters<typeof investmentFilterSchema.parse>[0] = {
        type: "stock",
        isActive: "true",
        page: "2",
        limit: "15",
      };

      expect(validData.type).toBe("stock");
      expect(validData.isActive).toBe("true");
      expect(validData.page).toBe("2");
      expect(validData.limit).toBe("15");
    });
  });
});
