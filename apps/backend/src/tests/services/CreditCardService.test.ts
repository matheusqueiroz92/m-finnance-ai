import { CreditCardService } from "../../services/CreditCardService";
import { ICreditCardRepository } from "../../interfaces/repositories/ICreditCardRepository";
import { ITransactionRepository } from "../../interfaces/repositories/ITransactionRepository";
import {
  ICreditCardCreateDTO,
  ICreditCardUpdateDTO,
  ICreditCardDTO,
} from "../../interfaces/entities/ICreditCard";
import { ApiError } from "../../utils/ApiError";
import { TransactionManager } from "../../utils/TransactionManager";

// Mock dependencies
jest.mock("../../utils/TransactionManager");
jest.mock("mongoose", () => ({
  Types: {
    ObjectId: jest.fn((id) => ({
      toString: () => id || "mock-object-id",
    })),
  },
}));

describe("CreditCardService", () => {
  let creditCardService: CreditCardService;
  let mockCreditCardRepository: jest.Mocked<ICreditCardRepository>;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    // Create mocks
    mockCreditCardRepository = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByCardNumber: jest.fn(),
    } as any;

    mockTransactionRepository = {
      findByAccount: jest.fn(),
    } as any;

    // Create service instance
    creditCardService = new CreditCardService(
      mockCreditCardRepository,
      mockTransactionRepository
    );

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("createCreditCard", () => {
    it("should create a new credit card", async () => {
      const userId = "test-user-id";
      const creditCardData: ICreditCardCreateDTO = {
        cardholderName: "João Silva",
        cardNumber: "4111111111111111",
        cardholderCpf: "11144477735", // Valid CPF
        expiryDate: "12/25",
        securityCode: "123",
        cardBrand: "visa",
        creditLimit: 1000,
        billingDueDay: 10,
      };

      const mockCreditCard: ICreditCardDTO = {
        _id: "card123",
        cardholderName: "João Silva",
        cardNumber: "1111",
        cardBrand: "visa",
        cardholderCpf: "11144477735", // Add this field for maskCPF
        expiryDate: "12/25",
        creditLimit: 1000,
        billingDueDay: 10,
        currentBalance: 0,
        availableLimit: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreditCardRepository.findByCardNumber.mockResolvedValue(null);
      mockCreditCardRepository.create.mockResolvedValue(mockCreditCard as any);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      const result = await creditCardService.createCreditCard(
        userId,
        creditCardData
      );

      expect(result).toBeDefined();
      expect(result._id).toBe("card123");
      expect(result.cardholderName).toBe("João Silva");
      expect(mockCreditCardRepository.findByCardNumber).toHaveBeenCalledWith(
        userId,
        creditCardData.cardNumber
      );
      expect(mockCreditCardRepository.create).toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      const userId = "test-user-id";
      const invalidData = {
        cardholderName: "",
        cardNumber: "",
        cardholderCpf: "",
        expiryDate: "",
        securityCode: "",
        cardBrand: "",
        creditLimit: 0,
        billingDueDay: 0,
      } as unknown as ICreditCardCreateDTO;

      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        creditCardService.createCreditCard(userId, invalidData)
      ).rejects.toThrow(ApiError);
    });

    it("should throw error for duplicate card number", async () => {
      const userId = "test-user-id";
      const creditCardData: ICreditCardCreateDTO = {
        cardholderName: "João Silva",
        cardNumber: "4111111111111111",
        cardholderCpf: "11144477735", // CPF válido
        expiryDate: "12/25",
        securityCode: "123",
        cardBrand: "visa",
        creditLimit: 1000,
        billingDueDay: 10,
      };

      const existingCard = {
        _id: "existing-card",
        cardholderName: "Existing Card",
      };

      mockCreditCardRepository.findByCardNumber.mockResolvedValue(
        existingCard as any
      );
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        creditCardService.createCreditCard(userId, creditCardData)
      ).rejects.toThrow(ApiError);
      await expect(
        creditCardService.createCreditCard(userId, creditCardData)
      ).rejects.toThrow("Cartão com este número já cadastrado");
    });

    it("should throw error for invalid CPF", async () => {
      const userId = "test-user-id";
      const creditCardData: ICreditCardCreateDTO = {
        cardholderName: "João Silva",
        cardNumber: "4111111111111111",
        cardholderCpf: "12345678901", // Invalid CPF
        expiryDate: "12/25",
        securityCode: "123",
        cardBrand: "visa",
        creditLimit: 1000,
        billingDueDay: 10,
      };

      mockCreditCardRepository.findByCardNumber.mockResolvedValue(null);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        creditCardService.createCreditCard(userId, creditCardData)
      ).rejects.toThrow(ApiError);
      await expect(
        creditCardService.createCreditCard(userId, creditCardData)
      ).rejects.toThrow("CPF inválido");
    });

    it("should throw error for expired card", async () => {
      const userId = "test-user-id";
      const creditCardData: ICreditCardCreateDTO = {
        cardholderName: "João Silva",
        cardNumber: "4111111111111111",
        cardholderCpf: "11144477735", // Valid CPF
        expiryDate: "01/20", // Expired
        securityCode: "123",
        cardBrand: "visa",
        creditLimit: 1000,
        billingDueDay: 10,
      };

      mockCreditCardRepository.findByCardNumber.mockResolvedValue(null);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        creditCardService.createCreditCard(userId, creditCardData)
      ).rejects.toThrow(ApiError);
      await expect(
        creditCardService.createCreditCard(userId, creditCardData)
      ).rejects.toThrow("Data de validade inválida ou cartão vencido");
    });
  });

  describe("getCreditCardsByUserId", () => {
    it("should return all credit cards for user", async () => {
      const userId = "test-user-id";
      const mockCards = [
        {
          _id: "card1",
          cardholderName: "João Silva",
          lastFourDigits: "1111",
          user: userId,
          cardholderCpf: "11144477735",
          cardNumber: "1111",
          expiryDate: "12/25",
          securityCode: "123",
          cardBrand: "visa",
          creditLimit: 5000,
          currentBalance: 0,
          availableLimit: 5000,
          billingDueDay: 15,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: "card2",
          cardholderName: "João Silva",
          lastFourDigits: "2222",
          user: userId,
          cardholderCpf: "11144477735",
          cardNumber: "2222",
          expiryDate: "12/25",
          securityCode: "123",
          cardBrand: "mastercard",
          creditLimit: 3000,
          currentBalance: 0,
          availableLimit: 3000,
          billingDueDay: 15,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock the expected result after mapToDTO transformation
      const expectedResult = [
        {
          _id: "card1",
          cardholderName: "João Silva",
          cardholderCpf: "111.***.***-444", // Masked CPF
          cardNumber: "1111",
          expiryDate: "12/25",
          cardBrand: "visa",
          creditLimit: 5000,
          currentBalance: 0,
          availableLimit: 5000,
          billingDueDay: 15,
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          _id: "card2",
          cardholderName: "João Silva",
          cardholderCpf: "111.***.***-444", // Masked CPF
          cardNumber: "2222",
          expiryDate: "12/25",
          cardBrand: "mastercard",
          creditLimit: 3000,
          currentBalance: 0,
          availableLimit: 3000,
          billingDueDay: 15,
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ];

      mockCreditCardRepository.findByUser.mockResolvedValue(mockCards as any);

      const result = await creditCardService.getCreditCardsByUserId(userId);

      expect(result).toEqual(expectedResult);
      expect(mockCreditCardRepository.findByUser).toHaveBeenCalledWith(
        userId,
        undefined
      );
    });

    it("should return empty array for user with no cards", async () => {
      const userId = "test-user-id";

      mockCreditCardRepository.findByUser.mockResolvedValue([]);

      const result = await creditCardService.getCreditCardsByUserId(userId);

      expect(result).toEqual([]);
      expect(mockCreditCardRepository.findByUser).toHaveBeenCalledWith(
        userId,
        undefined
      );
    });
  });

  describe("getCreditCardById", () => {
    it("should return credit card by id", async () => {
      const cardId = "card123";
      const userId = "user123";
      const mockCard = {
        _id: cardId,
        cardholderName: "João Silva",
        user: userId,
        cardholderCpf: "11144477735",
        cardNumber: "1111",
        expiryDate: "12/25",
        securityCode: "123",
        cardBrand: "visa",
        creditLimit: 5000,
        currentBalance: 0,
        availableLimit: 5000,
        billingDueDay: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResult = {
        _id: cardId,
        cardholderName: "João Silva",
        cardholderCpf: "111.***.***-444", // Masked CPF
        cardNumber: "1111",
        expiryDate: "12/25",
        cardBrand: "visa",
        creditLimit: 5000,
        currentBalance: 0,
        availableLimit: 5000,
        billingDueDay: 15,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockCreditCardRepository.findById.mockResolvedValue(mockCard as any);

      const result = await creditCardService.getCreditCardById(cardId, userId);

      expect(result).toEqual(expectedResult);
      expect(mockCreditCardRepository.findById).toHaveBeenCalledWith(
        cardId,
        userId
      );
    });

    it("should throw error for non-existent card", async () => {
      const cardId = "nonexistent";
      const userId = "user123";

      mockCreditCardRepository.findById.mockResolvedValue(null);

      await expect(
        creditCardService.getCreditCardById(cardId, userId)
      ).rejects.toThrow(ApiError);
      await expect(
        creditCardService.getCreditCardById(cardId, userId)
      ).rejects.toThrow("Cartão de crédito não encontrado");
    });
  });

  describe("updateCreditCard", () => {
    it("should update credit card", async () => {
      const cardId = "card123";
      const userId = "user123";
      const updateData: ICreditCardUpdateDTO = {
        cardholderName: "Updated Visa Gold",
      };

      const mockUpdatedCard = {
        _id: cardId,
        cardholderName: "Updated Visa Gold",
        user: userId,
        cardholderCpf: "11144477735",
        cardNumber: "1111",
        expiryDate: "12/25",
        securityCode: "123",
        cardBrand: "visa",
        creditLimit: 5000,
        currentBalance: 0,
        availableLimit: 5000,
        billingDueDay: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResult = {
        _id: cardId,
        cardholderName: "Updated Visa Gold",
        cardholderCpf: "111.***.***-444", // Masked CPF
        cardNumber: "1111",
        expiryDate: "12/25",
        cardBrand: "visa",
        creditLimit: 5000,
        currentBalance: 0,
        availableLimit: 5000,
        billingDueDay: 15,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockCreditCardRepository.findById.mockResolvedValue({
        _id: cardId,
        user: userId,
        cardholderCpf: "11144477735",
      } as any);
      mockCreditCardRepository.update.mockResolvedValue(mockUpdatedCard as any);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      const result = await creditCardService.updateCreditCard(
        cardId,
        userId,
        updateData
      );

      expect(result).toEqual(expectedResult);
      expect(mockCreditCardRepository.update).toHaveBeenCalledWith(
        cardId,
        userId,
        updateData,
        { session: null }
      );
    });

    it("should throw error for non-existent card", async () => {
      const cardId = "nonexistent";
      const userId = "user123";
      const updateData: ICreditCardUpdateDTO = {
        cardholderName: "Updated Card",
      };

      mockCreditCardRepository.findById.mockResolvedValue(null);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        creditCardService.updateCreditCard(cardId, userId, updateData)
      ).rejects.toThrow(ApiError);
      await expect(
        creditCardService.updateCreditCard(cardId, userId, updateData)
      ).rejects.toThrow("Cartão de crédito não encontrado");
    });
  });

  describe("deleteCreditCard", () => {
    it("should delete credit card", async () => {
      const cardId = "card123";
      const userId = "user123";

      mockCreditCardRepository.findById.mockResolvedValue({
        _id: cardId,
        user: userId,
      } as any);
      mockTransactionRepository.findByAccount.mockResolvedValue([]);
      mockCreditCardRepository.delete.mockResolvedValue(true);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await creditCardService.deleteCreditCard(cardId, userId);

      expect(mockCreditCardRepository.delete).toHaveBeenCalledWith(
        cardId,
        userId
      );
    });

    it("should throw error for non-existent card", async () => {
      const cardId = "nonexistent";
      const userId = "user123";

      mockCreditCardRepository.findById.mockResolvedValue(null);
      mockTransactionRepository.findByAccount.mockResolvedValue([]);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        creditCardService.deleteCreditCard(cardId, userId)
      ).rejects.toThrow(ApiError);
      await expect(
        creditCardService.deleteCreditCard(cardId, userId)
      ).rejects.toThrow("Cartão de crédito não encontrado");
    });

    it("should throw error if card has transactions", async () => {
      const cardId = "card123";
      const userId = "user123";

      mockCreditCardRepository.findById.mockResolvedValue({
        _id: cardId,
        user: userId,
      } as any);
      mockTransactionRepository.findByAccount.mockResolvedValue([
        { _id: "transaction1", account: cardId } as any,
      ]);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        creditCardService.deleteCreditCard(cardId, userId)
      ).rejects.toThrow(ApiError);
      await expect(
        creditCardService.deleteCreditCard(cardId, userId)
      ).rejects.toThrow(
        "Não é possível excluir um cartão que possui transações"
      );
    });
  });
});
