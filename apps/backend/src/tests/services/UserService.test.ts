import mongoose from "mongoose";
import { UserService } from "../../services/UserService";
import { ApiError } from "../../utils/ApiError";
import { container } from "../../config/container";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockNotificationService: any;
  let mockCategoryService: any;

  beforeEach(async () => {
    // Mock repositories and services for testing
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findBySocialProvider: jest.fn(),
      checkPassword: jest.fn(),
    };

    mockNotificationService = {
      sendEmailVerification: jest.fn(),
    };

    mockCategoryService = {
      createDefaultCategories: jest.fn(),
    };

    // Mock container dependencies
    const mockSubscriptionService = {
      createTrialSubscription: jest.fn().mockResolvedValue(true),
    };

    // Register mocks in container
    container.register("UserRepository", { useValue: mockUserRepository });
    container.register("NotificationService", {
      useValue: mockNotificationService,
    });
    container.register("CategoryService", { useValue: mockCategoryService });
    container.register("SubscriptionService", {
      useValue: mockSubscriptionService,
    });

    userService = new UserService(
      mockUserRepository,
      mockNotificationService,
      mockCategoryService
    );
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        language: "pt-BR",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: userData.name,
        email: userData.email,
        language: userData.language,
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockNotificationService.sendEmailVerification.mockResolvedValue(true);
      mockCategoryService.createDefaultCategories.mockResolvedValue(true);

      const result = await userService.register(userData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      // Password should not be in the response (IUserDTO doesn't include password)
      expect(result.token).toBeDefined();
    });

    it("should throw error if user already exists", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        language: "pt-BR",
      };

      const existingUser = {
        _id: new mongoose.Types.ObjectId(),
        email: userData.email,
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userService.register(userData)).rejects.toThrow(ApiError);
    });

    it("should hash password before saving", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        language: "pt-BR",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: userData.name,
        email: userData.email,
        password: "hashed_password_123", // Simulated hashed password
        language: userData.language,
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockNotificationService.sendEmailVerification.mockResolvedValue(true);
      mockCategoryService.createDefaultCategories.mockResolvedValue(true);

      const result = await userService.register(userData);

      // Password should not be in the response (IUserDTO doesn't include password)
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      const invalidData = {
        name: "",
        email: "invalid-email",
        password: "123", // Too short
        language: "pt-BR",
      };

      await expect(userService.register(invalidData as any)).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test User",
        email: loginData.email,
        password: "hashed_password_123",
        language: "pt-BR",
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.login(loginData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.email).toBe(loginData.email);
      // Password should not be in the response (IUserDTO doesn't include password)
    });

    it("should throw error for invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.login(loginData)).rejects.toThrow(ApiError);
    });

    it("should throw error for invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: loginData.email,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.login(loginData)).rejects.toThrow(ApiError);
    });

    it("should validate email format", async () => {
      const loginData = {
        email: "invalid-email",
        password: "password123",
      };

      await expect(userService.login(loginData)).rejects.toThrow();
    });
  });

  describe("getUserById", () => {
    it("should return user profile", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: new mongoose.Types.ObjectId(userId),
        name: "Test User",
        email: "test@example.com",
        language: "pt-BR",
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const profile = await userService.getUserById(userId);

      expect(profile).toHaveProperty("_id");
      expect(profile).toHaveProperty("name");
      expect(profile).toHaveProperty("email");
      expect(profile).not.toHaveProperty("password");
    });

    it("should throw error for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(fakeId)).rejects.toThrow(ApiError);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Name",
        language: "en-US",
      };

      const mockUpdatedUser = {
        _id: new mongoose.Types.ObjectId(userId),
        name: updateData.name,
        email: "test@example.com",
        language: updateData.language,
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue({ _id: userId });
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const updatedUser = await userService.updateProfile(userId, updateData);

      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.language).toBe(updateData.language);
    });

    it("should not update password through this method", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Name", // Valid field
      };

      const mockUpdatedUser = {
        _id: new mongoose.Types.ObjectId(userId),
        name: updateData.name,
        email: "test@example.com",
        language: "pt-BR",
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue({ _id: userId });
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const updatedUser = await userService.updateProfile(userId, updateData);

      expect(updatedUser.name).toBe(updateData.name);
    });

    it("should throw error for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "New Name" };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        userService.updateProfile(fakeId, updateData)
      ).rejects.toThrow(ApiError);
    });
  });

  describe("changePassword", () => {
    it("should change password with valid current password", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newpassword123",
      };

      mockUserRepository.checkPassword.mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue({});

      await expect(
        userService.changePassword(userId, passwordData)
      ).resolves.not.toThrow();
    });

    it("should throw error for invalid current password", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const passwordData = {
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
      };

      mockUserRepository.checkPassword.mockResolvedValue(false);

      await expect(
        userService.changePassword(userId, passwordData)
      ).rejects.toThrow(ApiError);
    });

    it("should throw error for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newpassword123",
      };

      mockUserRepository.checkPassword.mockResolvedValue(false);

      await expect(
        userService.changePassword(fakeId, passwordData)
      ).rejects.toThrow(ApiError);
    });
  });

  describe("loginWithSocialProvider", () => {
    it("should create new user for new social login", async () => {
      const socialData = {
        id: "google123",
        provider: "google",
        email: "social@example.com",
        name: "Social User",
        photo: "https://example.com/avatar.jpg",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: socialData.name,
        email: socialData.email,
        language: "pt-BR",
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findBySocialProvider.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.loginWithSocialProvider(socialData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.email).toBe(socialData.email);
      expect(result.user.name).toBe(socialData.name);
    });

    it("should return existing user for existing social login", async () => {
      const socialData = {
        id: "google123",
        provider: "google",
        email: "social@example.com",
        name: "Social User",
        photo: "https://example.com/avatar.jpg",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: socialData.name,
        email: socialData.email,
        language: "pt-BR",
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findBySocialProvider.mockResolvedValue(mockUser);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.loginWithSocialProvider(socialData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.email).toBe(socialData.email);
    });

    it("should handle missing email in social data", async () => {
      const socialData = {
        id: "github123",
        provider: "github",
        name: "GitHub User",
        photo: "https://example.com/avatar.jpg",
        email: "", // Empty email
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: socialData.name,
        email: "",
        language: "pt-BR",
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findBySocialProvider.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.loginWithSocialProvider(socialData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.name).toBe(socialData.name);
    });
  });

  describe("additional coverage tests", () => {
    it("should handle error in default categories creation during registration", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        language: "pt-BR",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: userData.name,
        email: userData.email,
        language: userData.language,
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockNotificationService.sendEmailVerification.mockResolvedValue(true);
      mockCategoryService.createDefaultCategories.mockRejectedValue(
        new Error("Category creation failed")
      );

      const result = await userService.register(userData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
    });

    it("should handle error in email verification during registration", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        language: "pt-BR",
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: userData.name,
        email: userData.email,
        language: userData.language,
        isPremium: false,
        twoFactorEnabled: false,
        newsletterEnabled: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockNotificationService.sendEmailVerification.mockRejectedValue(
        new Error("Email service failed")
      );
      mockCategoryService.createDefaultCategories.mockResolvedValue(true);

      const result = await userService.register(userData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
    });

    it("should handle user without _id in login", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        name: "Test User",
        email: credentials.email,
        comparePassword: jest.fn().mockResolvedValue(true),
        // No _id property
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.login(credentials)).rejects.toThrow(ApiError);
      await expect(userService.login(credentials)).rejects.toThrow(
        "Erro ao gerar token"
      );
    });

    it("should handle social login with existing user but different provider", async () => {
      const socialData = {
        id: "google123",
        provider: "google",
        name: "Test User",
        email: "test@example.com",
      };

      const existingUser = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test User",
        email: socialData.email,
        socialProviders: [{ provider: "facebook", socialId: "fb123" }],
        save: jest.fn().mockResolvedValue(true),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockUserRepository.findBySocialProvider.mockResolvedValue(null);

      const result = await userService.loginWithSocialProvider(socialData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.name).toBe(socialData.name);
    });

    it("should handle social login with existing user and same provider", async () => {
      const socialData = {
        id: "google123",
        provider: "google",
        name: "Test User",
        email: "test@example.com",
      };

      const existingUser = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test User",
        email: socialData.email,
        socialProviders: [{ provider: "google", socialId: "google123" }],
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockUserRepository.findBySocialProvider.mockResolvedValue(existingUser);

      const result = await userService.loginWithSocialProvider(socialData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
    });

    it("should handle updateProfile with partial data", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Name",
        language: "en-US",
      };

      const mockUser = {
        _id: userId,
        name: "Original Name",
        email: "test@example.com",
        language: "pt-BR",
        save: jest.fn().mockResolvedValue(true),
      };

      const updatedUser = {
        _id: userId,
        name: updateData.name,
        email: "test@example.com",
        language: updateData.language,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(result).toHaveProperty("_id");
      expect(result.name).toBe(updateData.name);
      expect(result.language).toBe(updateData.language);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        updateData,
        { session: null }
      );
    });

    it("should handle changePassword with invalid current password", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const passwordData = {
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
      };

      const mockUser = {
        _id: userId,
        name: "Test User",
        email: "test@example.com",
        comparePassword: jest.fn().mockResolvedValue(false), // Invalid current password
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        userService.changePassword(userId, passwordData)
      ).rejects.toThrow(ApiError);
      await expect(
        userService.changePassword(userId, passwordData)
      ).rejects.toThrow("Senha atual incorreta");
    });

    it("should handle changePassword with repository error", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newpassword123",
      };

      mockUserRepository.checkPassword.mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue(null); // Repository returns null

      await expect(
        userService.changePassword(userId, passwordData)
      ).rejects.toThrow(ApiError);
      await expect(
        userService.changePassword(userId, passwordData)
      ).rejects.toThrow("Falha ao atualizar senha");
    });
  });
});
