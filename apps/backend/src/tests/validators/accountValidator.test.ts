import {
  accountCreateSchema,
  accountUpdateSchema,
} from "../../validators/accountValidator";

describe("Account Validator", () => {
  describe("accountCreateSchema", () => {
    it("should validate valid account creation data", () => {
      const validData = {
        name: "Conta Corrente",
        type: "checking" as const,
        balance: 1000,
        institution: "Banco do Brasil",
        bankBrach: "001",
        accountNumber: "12345-6",
        isActive: true,
      };

      const result = accountCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should apply default values", () => {
      const dataWithoutDefaults = {
        name: "Conta Poupança",
        type: "savings" as const,
        institution: "Caixa Econômica",
      };

      const result = accountCreateSchema.safeParse(dataWithoutDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.balance).toBe(0);
        expect(result.data.isActive).toBe(true);
      }
    });

    it("should validate all account types", () => {
      const accountTypes = ["checking", "savings", "investment", "credit"];

      accountTypes.forEach((type) => {
        const data = {
          name: `Conta ${type}`,
          type,
          institution: "Banco Teste",
        };

        const result = accountCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid account type", () => {
      const invalidData = {
        name: "Conta Inválida",
        type: "invalid_type" as any,
        institution: "Banco Teste",
      };

      const result = accountCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Tipo inválido");
      }
    });

    it("should reject short account name", () => {
      const invalidData = {
        name: "A",
        type: "checking" as const,
        institution: "Banco Teste",
      };

      const result = accountCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject short institution name", () => {
      const invalidData = {
        name: "Conta Corrente",
        type: "checking" as const,
        institution: "A",
      };

      const result = accountCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Nome da instituição é obrigatório"
        );
      }
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        name: "Conta Corrente",
        // Missing type and institution
      };

      const result = accountCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it("should accept optional fields", () => {
      const dataWithOptionalFields = {
        name: "Conta Corrente",
        type: "checking" as const,
        institution: "Banco Teste",
        bankBrach: "001",
        accountNumber: "12345-6",
      };

      const result = accountCreateSchema.safeParse(dataWithOptionalFields);
      expect(result.success).toBe(true);
    });
  });

  describe("accountUpdateSchema", () => {
    it("should validate valid account update data", () => {
      const validData = {
        name: "Conta Atualizada",
        institution: "Novo Banco",
        bankBrach: "002",
        accountNumber: "54321-0",
        isActive: false,
      };

      const result = accountUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should accept partial update data", () => {
      const partialData = {
        name: "Novo Nome",
        isActive: false,
      };

      const result = accountUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Novo Nome");
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should accept empty update object", () => {
      const emptyData = {};

      const result = accountUpdateSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should reject short account name in update", () => {
      const invalidData = {
        name: "A",
      };

      const result = accountUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject short institution name in update", () => {
      const invalidData = {
        institution: "A",
      };

      const result = accountUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Nome da instituição é obrigatório"
        );
      }
    });

    it("should validate boolean isActive field", () => {
      const dataWithBoolean = {
        isActive: true,
      };

      const result = accountUpdateSchema.safeParse(dataWithBoolean);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });

    it("should accept undefined values", () => {
      const dataWithUndefined = {
        name: undefined,
        institution: undefined,
        isActive: undefined,
      };

      const result = accountUpdateSchema.safeParse(dataWithUndefined);
      expect(result.success).toBe(true);
    });
  });

  describe("Type inference", () => {
    it("should correctly infer AccountCreateInput type", () => {
      const validData: Parameters<typeof accountCreateSchema.parse>[0] = {
        name: "Conta Teste",
        type: "checking",
        institution: "Banco Teste",
      };

      expect(validData.name).toBe("Conta Teste");
      expect(validData.type).toBe("checking");
      expect(validData.institution).toBe("Banco Teste");
    });

    it("should correctly infer AccountUpdateInput type", () => {
      const validData: Parameters<typeof accountUpdateSchema.parse>[0] = {
        name: "Conta Atualizada",
        isActive: false,
      };

      expect(validData.name).toBe("Conta Atualizada");
      expect(validData.isActive).toBe(false);
    });
  });
});
