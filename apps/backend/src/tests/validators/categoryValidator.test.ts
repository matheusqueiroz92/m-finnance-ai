import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "../../validators/categoryValidator";

describe("Category Validator", () => {
  describe("categoryCreateSchema", () => {
    it("should validate valid category creation data", () => {
      const validData = {
        name: "Alimentação",
        type: "expense" as const,
        icon: "🍽️",
        color: "#FF5733",
        isDefault: false,
      };

      const result = categoryCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Alimentação");
        expect(result.data.type).toBe("expense");
        expect(result.data.icon).toBe("🍽️");
        expect(result.data.color).toBe("#FF5733");
        expect(result.data.isDefault).toBe(false);
      }
    });

    it("should apply default values", () => {
      const dataWithoutDefaults = {
        name: "Salário",
        type: "income" as const,
      };

      const result = categoryCreateSchema.safeParse(dataWithoutDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
      }
    });

    it("should validate all category types", () => {
      const categoryTypes = ["income", "expense", "investment"];

      categoryTypes.forEach((type) => {
        const data = {
          name: `Categoria ${type}`,
          type,
        };

        const result = categoryCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept optional fields", () => {
      const dataWithOptionals = {
        name: "Categoria Completa",
        type: "investment" as const,
        icon: "📈",
        color: "#00FF00",
        isDefault: true,
      };

      const result = categoryCreateSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.icon).toBe("📈");
        expect(result.data.color).toBe("#00FF00");
        expect(result.data.isDefault).toBe(true);
      }
    });

    it("should reject short category name", () => {
      const invalidData = {
        name: "A",
        type: "expense" as const,
      };

      const result = categoryCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject invalid category type", () => {
      const invalidData = {
        name: "Categoria Inválida",
        type: "invalid_type" as any,
      };

      const result = categoryCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Tipo inválido");
      }
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        name: "Categoria sem tipo",
        // Missing type
      };

      const result = categoryCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it("should validate boolean isDefault field", () => {
      const dataWithBoolean = {
        name: "Categoria Padrão",
        type: "expense" as const,
        isDefault: true,
      };

      const result = categoryCreateSchema.safeParse(dataWithBoolean);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(true);
      }
    });

    it("should handle empty icon and color", () => {
      const dataWithEmptyOptionals = {
        name: "Categoria Simples",
        type: "income" as const,
        icon: "",
        color: "",
      };

      const result = categoryCreateSchema.safeParse(dataWithEmptyOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.icon).toBe("");
        expect(result.data.color).toBe("");
      }
    });
  });

  describe("categoryUpdateSchema", () => {
    it("should validate valid category update data", () => {
      const validData = {
        name: "Alimentação Atualizada",
        icon: "🍕",
        color: "#FF0000",
      };

      const result = categoryUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Alimentação Atualizada");
        expect(result.data.icon).toBe("🍕");
        expect(result.data.color).toBe("#FF0000");
      }
    });

    it("should accept partial update data", () => {
      const partialData = {
        name: "Novo Nome da Categoria",
        icon: "💡",
      };

      const result = categoryUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Novo Nome da Categoria");
        expect(result.data.icon).toBe("💡");
      }
    });

    it("should accept empty update object", () => {
      const emptyData = {};

      const result = categoryUpdateSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should accept single field update", () => {
      const singleFieldData = {
        name: "Apenas Nome Atualizado",
      };

      const result = categoryUpdateSchema.safeParse(singleFieldData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Apenas Nome Atualizado");
      }
    });

    it("should reject short category name in update", () => {
      const invalidData = {
        name: "A",
      };

      const result = categoryUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should accept undefined values", () => {
      const dataWithUndefined = {
        name: undefined,
        icon: undefined,
        color: undefined,
      };

      const result = categoryUpdateSchema.safeParse(dataWithUndefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBeUndefined();
        expect(result.data.icon).toBeUndefined();
        expect(result.data.color).toBeUndefined();
      }
    });

    it("should validate all optional fields", () => {
      const dataWithAllFields = {
        name: "Categoria Completa Atualizada",
        icon: "🎯",
        color: "#0000FF",
      };

      const result = categoryUpdateSchema.safeParse(dataWithAllFields);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Categoria Completa Atualizada");
        expect(result.data.icon).toBe("🎯");
        expect(result.data.color).toBe("#0000FF");
      }
    });

    it("should handle long category names", () => {
      const dataWithLongName = {
        name: "Categoria com Nome Muito Longo para Teste de Validação",
      };

      const result = categoryUpdateSchema.safeParse(dataWithLongName);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(
          "Categoria com Nome Muito Longo para Teste de Validação"
        );
      }
    });

    it("should handle special characters in name", () => {
      const dataWithSpecialChars = {
        name: "Categoria com Acentos: Ação, Coração, Não",
      };

      const result = categoryUpdateSchema.safeParse(dataWithSpecialChars);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(
          "Categoria com Acentos: Ação, Coração, Não"
        );
      }
    });
  });

  describe("Type inference", () => {
    it("should correctly infer CategoryCreateInput type", () => {
      const validData: Parameters<typeof categoryCreateSchema.parse>[0] = {
        name: "Categoria Teste",
        type: "expense",
      };

      expect(validData.name).toBe("Categoria Teste");
      expect(validData.type).toBe("expense");
    });

    it("should correctly infer CategoryUpdateInput type", () => {
      const validData: Parameters<typeof categoryUpdateSchema.parse>[0] = {
        name: "Categoria Atualizada",
        color: "#FF0000",
      };

      expect(validData.name).toBe("Categoria Atualizada");
      expect(validData.color).toBe("#FF0000");
    });
  });

  describe("Edge cases", () => {
    it("should handle minimum valid name length", () => {
      const dataWithMinName = {
        name: "AB", // Exactly 2 characters
        type: "income" as const,
      };

      const result = categoryCreateSchema.safeParse(dataWithMinName);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("AB");
      }
    });

    it("should handle all boolean values for isDefault", () => {
      const booleanValues = [true, false];

      booleanValues.forEach((value) => {
        const data = {
          name: `Categoria ${value}`,
          type: "expense" as const,
          isDefault: value,
        };

        const result = categoryCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isDefault).toBe(value);
        }
      });
    });

    it("should handle different icon formats", () => {
      const iconFormats = ["🔥", "123", "abc", "🎉", "💰"];

      iconFormats.forEach((icon) => {
        const data = {
          name: `Categoria ${icon}`,
          type: "expense" as const,
          icon,
        };

        const result = categoryCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.icon).toBe(icon);
        }
      });
    });

    it("should handle different color formats", () => {
      const colorFormats = [
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "red",
        "blue",
        "rgb(255,0,0)",
      ];

      colorFormats.forEach((color) => {
        const data = {
          name: `Categoria ${color}`,
          type: "expense" as const,
          color,
        };

        const result = categoryCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.color).toBe(color);
        }
      });
    });
  });
});
