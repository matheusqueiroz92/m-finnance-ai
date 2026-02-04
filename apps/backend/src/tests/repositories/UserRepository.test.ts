import { UserRepository } from "../../repositories/UserRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import { UserModel } from "../../schemas/UserSchema";

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    userRepository = new UserRepository();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        language: "pt-BR",
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.language).toBe(userData.language);
      expect(user._id).toBeDefined();
    });

    it("should throw error for duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        language: "pt-BR",
      };

      // Create first user
      await userRepository.create(userData);

      // Try to create second user with same email
      await expect(userRepository.create(userData)).rejects.toThrow();
    });
  });

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      const user = await TestDataFactory.createUser({
        email: "findme@example.com",
      });

      const foundUser = await userRepository.findByEmail("findme@example.com");

      expect(foundUser).toBeDefined();
      expect(foundUser?._id.toString()).toBe(user._id.toString());
      expect(foundUser?.email).toBe("findme@example.com");
    });

    it("should return null for non-existent email", async () => {
      const foundUser = await userRepository.findByEmail(
        "nonexistent@example.com"
      );

      expect(foundUser).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      const user = await TestDataFactory.createUser();

      const foundUser = await userRepository.findById(user._id.toString());

      expect(foundUser).toBeDefined();
      expect(foundUser?._id.toString()).toBe(user._id.toString());
    });

    it("should return null for non-existent id", async () => {
      const foundUser = await userRepository.findById(
        "507f1f77bcf86cd799439011"
      );

      expect(foundUser).toBeNull();
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      const user = await TestDataFactory.createUser();
      const updateData = {
        name: "Updated Name",
        phone: "123456789",
      };

      const updatedUser = await userRepository.update(
        user._id.toString(),
        updateData
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.phone).toBe(updateData.phone);
    });

    it("should return null for non-existent user", async () => {
      const updateData = { name: "Updated Name" };

      const updatedUser = await userRepository.update(
        "507f1f77bcf86cd799439011",
        updateData
      );

      expect(updatedUser).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      const user = await TestDataFactory.createUser();

      const result = await userRepository.delete(user._id.toString());

      expect(result).toBeDefined();
      expect(result?._id.toString()).toBe(user._id.toString());

      // Verify user is deleted
      const deletedUser = await userRepository.findById(user._id.toString());
      expect(deletedUser).toBeNull();
    });

    it("should return null for non-existent user", async () => {
      const result = await userRepository.delete("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      // Create multiple users
      await TestDataFactory.createUser({ email: "user1@example.com" });
      await TestDataFactory.createUser({ email: "user2@example.com" });
      await TestDataFactory.createUser({ email: "user3@example.com" });

      const result = await userRepository.findAll();

      expect(result.users).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it("should return empty array when no users exist", async () => {
      const result = await userRepository.findAll();

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
