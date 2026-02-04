import {
  creditCardCreateSchema,
  creditCardUpdateSchema,
  validateSecurityCodeSchema,
} from "../../validators/creditCardValidator";

describe("Credit Card Validator", () => {
  describe("creditCardCreateSchema", () => {
    it("should validate valid credit card creation data", () => {
      const validData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva Santos",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cardNumber).toBe("4111111111111111");
        expect(result.data.cardBrand).toBe("visa");
        expect(result.data.cardholderName).toBe("João Silva Santos");
        expect(result.data.creditLimit).toBe(5000);
      }
    });

    it("should validate all card brands", () => {
      const cardBrands = [
        "visa",
        "mastercard",
        "elo",
        "american_express",
        "diners",
        "hipercard",
        "other",
      ];

      cardBrands.forEach((brand) => {
        const data = {
          cardNumber: "4111111111111111",
          cardBrand: brand,
          cardholderName: "João Silva",
          cardholderCpf: "12345678901",
          expiryDate: "12/25",
          securityCode: "123",
          creditLimit: 5000,
          billingDueDay: 15,
        };

        const result = creditCardCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should validate minimum card number length", () => {
      const validData = {
        cardNumber: "1234567890123", // 13 digits
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate maximum card number length", () => {
      const validData = {
        cardNumber: "1234567890123456789", // 19 digits
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject short card number", () => {
      const invalidData = {
        cardNumber: "123456789012", // 12 digits
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 13 dígitos"
        );
      }
    });

    it("should reject long card number", () => {
      const invalidData = {
        cardNumber: "12345678901234567890", // 20 digits
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "no máximo 19 dígitos"
        );
      }
    });

    it("should reject card number with non-digits", () => {
      const invalidData = {
        cardNumber: "4111-1111-1111-1111", // With dashes
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("apenas dígitos");
      }
    });

    it("should reject invalid card brand", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "invalid_brand" as any,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Bandeira inválida");
      }
    });

    it("should reject short cardholder name", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "Jo", // 2 characters
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 3 caracteres"
        );
      }
    });

    it("should reject long cardholder name", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "A".repeat(101), // 101 characters
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "no máximo 100 caracteres"
        );
      }
    });

    it("should reject invalid CPF format", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "123456789", // 9 digits
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("11 dígitos");
      }
    });

    it("should reject invalid expiry date format", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12-25", // Wrong format
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("formato MM/YY");
      }
    });

    it("should reject short security code", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "12", // 2 digits
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 3 dígitos"
        );
      }
    });

    it("should reject long security code", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "12345", // 5 digits
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("no máximo 4 dígitos");
      }
    });

    it("should reject security code with non-digits", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "12a", // With letter
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("apenas dígitos");
      }
    });

    it("should reject zero credit limit", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 0,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject negative credit limit", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: -1000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject invalid billing due day (too low)", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 0,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("entre 1 e 31");
      }
    });

    it("should reject invalid billing due day (too high)", () => {
      const invalidData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 32,
      };

      const result = creditCardCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("entre 1 e 31");
      }
    });

    it("should accept valid billing due day limits", () => {
      const validDays = [1, 15, 31];

      validDays.forEach((day) => {
        const data = {
          cardNumber: "4111111111111111",
          cardBrand: "visa" as const,
          cardholderName: "João Silva",
          cardholderCpf: "12345678901",
          expiryDate: "12/25",
          securityCode: "123",
          creditLimit: 5000,
          billingDueDay: day,
        };

        const result = creditCardCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept 4-digit security code", () => {
      const validData = {
        cardNumber: "4111111111111111",
        cardBrand: "visa" as const,
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "1234", // 4 digits
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const result = creditCardCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.securityCode).toBe("1234");
      }
    });
  });

  describe("creditCardUpdateSchema", () => {
    it("should validate valid credit card update data", () => {
      const validData = {
        cardholderName: "João Silva Atualizado",
        expiryDate: "12/26",
        securityCode: "456",
        creditLimit: 8000,
        billingDueDay: 20,
        isActive: true,
      };

      const result = creditCardUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cardholderName).toBe("João Silva Atualizado");
        expect(result.data.expiryDate).toBe("12/26");
        expect(result.data.creditLimit).toBe(8000);
        expect(result.data.isActive).toBe(true);
      }
    });

    it("should accept partial update data", () => {
      const partialData = {
        creditLimit: 10000,
        isActive: false,
      };

      const result = creditCardUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.creditLimit).toBe(10000);
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should accept empty update object", () => {
      const emptyData = {};

      const result = creditCardUpdateSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should reject short cardholder name in update", () => {
      const invalidData = {
        cardholderName: "Jo", // 2 characters
      };

      const result = creditCardUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 3 caracteres"
        );
      }
    });

    it("should reject invalid expiry date format in update", () => {
      const invalidData = {
        expiryDate: "12-26", // Wrong format
      };

      const result = creditCardUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("formato MM/YY");
      }
    });

    it("should reject zero credit limit in update", () => {
      const invalidData = {
        creditLimit: 0,
      };

      const result = creditCardUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que zero");
      }
    });

    it("should reject invalid billing due day in update", () => {
      const invalidData = {
        billingDueDay: 32,
      };

      const result = creditCardUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("entre 1 e 31");
      }
    });

    it("should validate boolean isActive field", () => {
      const dataWithBoolean = {
        isActive: false,
      };

      const result = creditCardUpdateSchema.safeParse(dataWithBoolean);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });
  });

  describe("validateSecurityCodeSchema", () => {
    it("should validate valid security code", () => {
      const validData = {
        securityCode: "123",
      };

      const result = validateSecurityCodeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.securityCode).toBe("123");
      }
    });

    it("should validate 4-digit security code", () => {
      const validData = {
        securityCode: "1234",
      };

      const result = validateSecurityCodeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.securityCode).toBe("1234");
      }
    });

    it("should reject short security code", () => {
      const invalidData = {
        securityCode: "12",
      };

      const result = validateSecurityCodeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 3 dígitos"
        );
      }
    });

    it("should reject long security code", () => {
      const invalidData = {
        securityCode: "12345",
      };

      const result = validateSecurityCodeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("no máximo 4 dígitos");
      }
    });

    it("should reject security code with non-digits", () => {
      const invalidData = {
        securityCode: "12a",
      };

      const result = validateSecurityCodeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("apenas dígitos");
      }
    });
  });

  describe("Type inference", () => {
    it("should correctly infer CreditCardCreateInput type", () => {
      const validData: Parameters<typeof creditCardCreateSchema.parse>[0] = {
        cardNumber: "4111111111111111",
        cardBrand: "visa",
        cardholderName: "João Silva",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      expect(validData.cardNumber).toBe("4111111111111111");
      expect(validData.cardBrand).toBe("visa");
      expect(validData.creditLimit).toBe(5000);
    });

    it("should correctly infer CreditCardUpdateInput type", () => {
      const validData: Parameters<typeof creditCardUpdateSchema.parse>[0] = {
        creditLimit: 8000,
        isActive: true,
      };

      expect(validData.creditLimit).toBe(8000);
      expect(validData.isActive).toBe(true);
    });

    it("should correctly infer ValidateSecurityCodeInput type", () => {
      const validData: Parameters<typeof validateSecurityCodeSchema.parse>[0] =
        {
          securityCode: "123",
        };

      expect(validData.securityCode).toBe("123");
    });
  });
});
