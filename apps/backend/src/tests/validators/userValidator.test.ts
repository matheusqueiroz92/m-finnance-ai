import {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  changePasswordSchema,
} from "../../validators/userValidator";

describe("User Validator", () => {
  describe("userRegisterSchema", () => {
    it("should validate valid user registration data", () => {
      const validData = {
        name: "João Silva",
        email: "joao@example.com",
        password: "123456",
        dateOfBirth: "1990-01-01",
        cpf: "12345678901",
        phone: "11999999999",
        language: "pt-BR",
        avatar: "avatar-url",
      };

      const result = userRegisterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("João Silva");
        expect(result.data.email).toBe("joao@example.com");
        expect(result.data.password).toBe("123456");
        expect(result.data.dateOfBirth).toBeInstanceOf(Date);
        expect(result.data.language).toBe("pt-BR");
      }
    });

    it("should apply default language value", () => {
      const dataWithoutLanguage = {
        name: "Maria Silva",
        email: "maria@example.com",
        password: "123456",
      };

      const result = userRegisterSchema.safeParse(dataWithoutLanguage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.language).toBe("pt-BR");
      }
    });

    it("should transform dateOfBirth string to Date", () => {
      const dataWithDate = {
        name: "Pedro Silva",
        email: "pedro@example.com",
        password: "123456",
        dateOfBirth: "1985-05-15",
      };

      const result = userRegisterSchema.safeParse(dataWithDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dateOfBirth).toBeInstanceOf(Date);
        expect(result.data.dateOfBirth?.getFullYear()).toBe(1985);
        expect(result.data.dateOfBirth?.getMonth()).toBe(4); // May is month 4 (0-indexed)
        expect(result.data.dateOfBirth?.getDate()).toBe(14); // UTC conversion
      }
    });

    it("should handle undefined dateOfBirth", () => {
      const dataWithoutDate = {
        name: "Ana Silva",
        email: "ana@example.com",
        password: "123456",
      };

      const result = userRegisterSchema.safeParse(dataWithoutDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dateOfBirth).toBeUndefined();
      }
    });

    it("should reject short name", () => {
      const invalidData = {
        name: "A",
        email: "test@example.com",
        password: "123456",
      };

      const result = userRegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "João Silva",
        email: "invalid-email",
        password: "123456",
      };

      const result = userRegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Email inválido");
      }
    });

    it("should reject short password", () => {
      const invalidData = {
        name: "João Silva",
        email: "joao@example.com",
        password: "12345",
      };

      const result = userRegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 6 caracteres"
        );
      }
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        name: "João Silva",
        // Missing email and password
      };

      const result = userRegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it("should accept optional fields", () => {
      const dataWithOptionals = {
        name: "João Silva",
        email: "joao@example.com",
        password: "123456",
        cpf: "12345678901",
        phone: "11999999999",
        avatar: "avatar-url",
      };

      const result = userRegisterSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe("userLoginSchema", () => {
    it("should validate valid login data", () => {
      const validData = {
        email: "joao@example.com",
        password: "123456",
      };

      const result = userLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("joao@example.com");
        expect(result.data.password).toBe("123456");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "123456",
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Email inválido");
      }
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "joao@example.com",
        password: "",
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Senha é obrigatória");
      }
    });

    it("should reject missing fields", () => {
      const invalidData = {
        email: "joao@example.com",
        // Missing password
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("userUpdateSchema", () => {
    it("should validate valid user update data", () => {
      const validData = {
        name: "João Silva Atualizado",
        email: "joao.novo@example.com",
        dateOfBirth: "1990-01-01",
        phone: "11888888888",
        language: "en-US",
        twoFactorEnabled: true,
        newsletterEnabled: false,
        avatar: "new-avatar-url",
      };

      const result = userUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("João Silva Atualizado");
        expect(result.data.email).toBe("joao.novo@example.com");
        expect(result.data.dateOfBirth).toBeInstanceOf(Date);
        expect(result.data.twoFactorEnabled).toBe(true);
        expect(result.data.newsletterEnabled).toBe(false);
      }
    });

    it("should accept partial update data", () => {
      const partialData = {
        name: "Novo Nome",
        twoFactorEnabled: true,
      };

      const result = userUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Novo Nome");
        expect(result.data.twoFactorEnabled).toBe(true);
      }
    });

    it("should accept empty update object", () => {
      const emptyData = {};

      const result = userUpdateSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it("should reject short name in update", () => {
      const invalidData = {
        name: "A",
      };

      const result = userUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("should reject invalid email in update", () => {
      const invalidData = {
        email: "invalid-email",
      };

      const result = userUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Email inválido");
      }
    });

    it("should transform dateOfBirth string to Date in update", () => {
      const dataWithDate = {
        dateOfBirth: "1995-12-25",
      };

      const result = userUpdateSchema.safeParse(dataWithDate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dateOfBirth).toBeInstanceOf(Date);
        expect(result.data.dateOfBirth?.getFullYear()).toBe(1995);
        expect(result.data.dateOfBirth?.getMonth()).toBe(11); // December is month 11 (0-indexed)
        expect(result.data.dateOfBirth?.getDate()).toBe(24); // UTC conversion
      }
    });

    it("should handle boolean fields", () => {
      const dataWithBooleans = {
        twoFactorEnabled: true,
        newsletterEnabled: false,
      };

      const result = userUpdateSchema.safeParse(dataWithBooleans);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.twoFactorEnabled).toBe(true);
        expect(result.data.newsletterEnabled).toBe(false);
      }
    });
  });

  describe("changePasswordSchema", () => {
    it("should validate valid password change data", () => {
      const validData = {
        currentPassword: "oldpassword",
        newPassword: "newpassword123",
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentPassword).toBe("oldpassword");
        expect(result.data.newPassword).toBe("newpassword123");
      }
    });

    it("should reject empty current password", () => {
      const invalidData = {
        currentPassword: "",
        newPassword: "newpassword123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Senha atual é obrigatória"
        );
      }
    });

    it("should reject short new password", () => {
      const invalidData = {
        currentPassword: "oldpassword",
        newPassword: "12345",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 6 caracteres"
        );
      }
    });

    it("should reject missing fields", () => {
      const invalidData = {
        currentPassword: "oldpassword",
        // Missing newPassword
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it("should accept minimum length new password", () => {
      const validData = {
        currentPassword: "oldpassword",
        newPassword: "123456", // Exactly 6 characters
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.newPassword).toBe("123456");
      }
    });
  });

  describe("Type inference", () => {
    it("should correctly infer UserRegisterInput type", () => {
      const validData: Parameters<typeof userRegisterSchema.parse>[0] = {
        name: "João Silva",
        email: "joao@example.com",
        password: "123456",
      };

      expect(validData.name).toBe("João Silva");
      expect(validData.email).toBe("joao@example.com");
      expect(validData.password).toBe("123456");
    });

    it("should correctly infer UserLoginInput type", () => {
      const validData: Parameters<typeof userLoginSchema.parse>[0] = {
        email: "joao@example.com",
        password: "123456",
      };

      expect(validData.email).toBe("joao@example.com");
      expect(validData.password).toBe("123456");
    });

    it("should correctly infer UserUpdateInput type", () => {
      const validData: Parameters<typeof userUpdateSchema.parse>[0] = {
        name: "João Atualizado",
        twoFactorEnabled: true,
      };

      expect(validData.name).toBe("João Atualizado");
      expect(validData.twoFactorEnabled).toBe(true);
    });

    it("should correctly infer ChangePasswordInput type", () => {
      const validData: Parameters<typeof changePasswordSchema.parse>[0] = {
        currentPassword: "old",
        newPassword: "new123",
      };

      expect(validData.currentPassword).toBe("old");
      expect(validData.newPassword).toBe("new123");
    });
  });
});
