import {
  goalCreateSchema,
  goalUpdateSchema,
} from "../../validators/goalValidator";

describe("Goal Validator", () => {
  describe("goalCreateSchema", () => {
    it("should validate valid goal creation data", () => {
      const validData = {
        name: "Viagem para Europa",
        targetAmount: 10000,
        currentAmount: 2500,
        startDate: "2024-01-01",
        targetDate: "2024-12-31",
        category: "viagem",
        icon: "✈️",
        notes: "Economizar para viajar pela Europa",
      };

      const result = goalCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Viagem para Europa");
        expect(result.data.targetAmount).toBe(10000);
        expect(result.data.currentAmount).toBe(2500);
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.targetDate).toBeInstanceOf(Date);
        expect(result.data.category).toBe("viagem");
      }
    });

    it("should apply default values", () => {
      const dataWithoutDefaults = {
        name: "Casa Nova",
        targetAmount: 500000,
        targetDate: "2025-12-31",
      };

      const result = goalCreateSchema.safeParse(dataWithoutDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentAmount).toBe(0);
        expect(result.data.startDate).toBeInstanceOf(Date);
      }
    });

    it("should transform date strings to Date objects", () => {
      const dataWithDates = {
        name: "Carro Novo",
        targetAmount: 80000,
        startDate: "2024-06-01",
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(dataWithDates);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.targetDate).toBeInstanceOf(Date);
        expect(result.data.startDate?.getFullYear()).toBe(2024);
        expect(result.data.targetDate?.getFullYear()).toBe(2024);
      }
    });

    it("should reject short goal name", () => {
      const invalidData = {
        name: "A",
        targetAmount: 1000,
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject negative target amount", () => {
      const invalidData = {
        name: "Meta Inválida",
        targetAmount: -1000,
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject zero target amount", () => {
      const invalidData = {
        name: "Meta Zero",
        targetAmount: 0,
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject negative current amount", () => {
      const invalidData = {
        name: "Meta com valor negativo",
        targetAmount: 1000,
        currentAmount: -100,
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "não pode ser negativo"
        );
      }
    });

    it("should accept zero current amount", () => {
      const validData = {
        name: "Meta Inicial",
        targetAmount: 1000,
        currentAmount: 0,
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentAmount).toBe(0);
      }
    });

    it("should accept optional fields", () => {
      const dataWithOptionals = {
        name: "Meta Completa",
        targetAmount: 5000,
        targetDate: "2024-12-31",
        category: "pessoal",
        icon: "💰",
        notes: "Meta pessoal de economia",
      };

      const result = goalCreateSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("pessoal");
        expect(result.data.icon).toBe("💰");
        expect(result.data.notes).toBe("Meta pessoal de economia");
      }
    });

    it("should handle undefined start date", () => {
      const dataWithoutStartDate = {
        name: "Meta sem data inicial",
        targetAmount: 1000,
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(dataWithoutStartDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
      }
    });

    it("should handle empty start date string", () => {
      const dataWithEmptyStartDate = {
        name: "Meta com data vazia",
        targetAmount: 1000,
        startDate: "",
        targetDate: "2024-12-31",
      };

      const result = goalCreateSchema.safeParse(dataWithEmptyStartDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
      }
    });
  });

  describe("goalUpdateSchema", () => {
    it("should validate valid goal update data", () => {
      const validData = {
        name: "Viagem Atualizada",
        targetAmount: 12000,
        currentAmount: 3000,
        targetDate: "2025-06-30",
        category: "lazer",
        icon: "🏖️",
        notes: "Meta atualizada para o próximo ano",
      };

      const result = goalUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Viagem Atualizada");
        expect(result.data.targetAmount).toBe(12000);
        expect(result.data.currentAmount).toBe(3000);
        expect(result.data.targetDate).toBeInstanceOf(Date);
      }
    });

    it("should accept partial update data", () => {
      const partialData = {
        name: "Novo Nome da Meta",
        currentAmount: 5000,
      };

      const result = goalUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Novo Nome da Meta");
        expect(result.data.currentAmount).toBe(5000);
      }
    });

    it("should accept empty update object", () => {
      const emptyData = {};

      const result = goalUpdateSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should reject short goal name in update", () => {
      const invalidData = {
        name: "A",
      };

      const result = goalUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject negative target amount in update", () => {
      const invalidData = {
        targetAmount: -500,
      };

      const result = goalUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject negative current amount in update", () => {
      const invalidData = {
        currentAmount: -200,
      };

      const result = goalUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "não pode ser negativo"
        );
      }
    });

    it("should accept zero current amount in update", () => {
      const validData = {
        currentAmount: 0,
      };

      const result = goalUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentAmount).toBe(0);
      }
    });

    it("should transform target date string to Date in update", () => {
      const dataWithDate = {
        targetDate: "2025-03-15",
      };

      const result = goalUpdateSchema.safeParse(dataWithDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetDate).toBeInstanceOf(Date);
        expect(result.data.targetDate?.getFullYear()).toBe(2025);
        expect(result.data.targetDate?.getMonth()).toBe(2); // March is month 2 (0-indexed)
      }
    });

    it("should handle undefined target date in update", () => {
      const dataWithUndefinedDate = {
        name: "Meta sem data",
        targetDate: undefined,
      };

      const result = goalUpdateSchema.safeParse(dataWithUndefinedDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetDate).toBeUndefined();
      }
    });

    it("should handle empty target date string in update", () => {
      const dataWithEmptyDate = {
        name: "Meta com data vazia",
        targetDate: "",
      };

      const result = goalUpdateSchema.safeParse(dataWithEmptyDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetDate).toBeUndefined();
      }
    });

    it("should validate all optional fields", () => {
      const dataWithAllOptionals = {
        name: "Meta Completa",
        targetAmount: 15000,
        currentAmount: 7500,
        targetDate: "2025-12-31",
        category: "investimento",
        icon: "📈",
        notes: "Meta de investimento atualizada",
      };

      const result = goalUpdateSchema.safeParse(dataWithAllOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Meta Completa");
        expect(result.data.targetAmount).toBe(15000);
        expect(result.data.currentAmount).toBe(7500);
        expect(result.data.targetDate).toBeInstanceOf(Date);
        expect(result.data.category).toBe("investimento");
        expect(result.data.icon).toBe("📈");
        expect(result.data.notes).toBe("Meta de investimento atualizada");
      }
    });
  });

  describe("Type inference", () => {
    it("should correctly infer GoalCreateInput type", () => {
      const validData: Parameters<typeof goalCreateSchema.parse>[0] = {
        name: "Meta Teste",
        targetAmount: 1000,
        targetDate: "2024-12-31",
      };

      expect(validData.name).toBe("Meta Teste");
      expect(validData.targetAmount).toBe(1000);
      expect(validData.targetDate).toBe("2024-12-31");
    });

    it("should correctly infer GoalUpdateInput type", () => {
      const validData: Parameters<typeof goalUpdateSchema.parse>[0] = {
        name: "Meta Atualizada",
        targetAmount: 2000,
      };

      expect(validData.name).toBe("Meta Atualizada");
      expect(validData.targetAmount).toBe(2000);
    });
  });
});
