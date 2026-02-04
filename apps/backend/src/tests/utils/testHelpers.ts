import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserModel as User } from "../../schemas/UserSchema";
import { TransactionModel as Transaction } from "../../schemas/TransactionSchema";
import { GoalModel as Goal } from "../../schemas/GoalSchema";
import { CategoryModel as Category } from "../../schemas/CategorySchema";
import { AccountModel as Account } from "../../schemas/AccountSchema";
import { CreditCardModel as CreditCard } from "../../schemas/CreditCardSchema";
import { InvestmentModel as Investment } from "../../schemas/InvestmentSchema";
import { SubscriptionModel as Subscription } from "../../schemas/SubscriptionSchema";

export class TestDatabase {
  private static mongoServer: MongoMemoryServer;
  private static isConnected = false;

  static async setup() {
    if (!this.isConnected) {
      // Se já há uma conexão ativa, desconecte primeiro
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      this.mongoServer = await MongoMemoryServer.create();
      const uri = this.mongoServer.getUri();
      await mongoose.connect(uri);
      this.isConnected = true;
    }
  }

  static async cleanup() {
    if (this.isConnected) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        if (collection) {
          await collection.deleteMany({});
        }
      }
    }
  }

  static async teardown() {
    if (this.isConnected) {
      await mongoose.disconnect();
      await this.mongoServer.stop();
      this.isConnected = false;
    }
  }
}

export class TestDataFactory {
  static async createUser(overrides: any = {}) {
    const defaultUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      language: "pt-BR",
      ...overrides,
    };

    return await User.create(defaultUser);
  }

  static async createCategory(userId: string, overrides: any = {}) {
    const defaultCategory = {
      name: "Alimentação",
      type: "expense", // Campo obrigatório: income, expense, ou investment
      color: "#FF5733",
      user: userId,
      ...overrides,
    };

    return await Category.create(defaultCategory);
  }

  static async createTransaction(userId: string, overrides: any = {}) {
    // Se não forneceu category ou account nos overrides, criar automaticamente
    let category = overrides.category;
    let account = overrides.account;

    if (!category) {
      const newCategory = await this.createCategory(userId, {
        type: overrides.type || "expense",
      });
      category = newCategory._id;
    }

    if (!account) {
      const newAccount = await this.createAccount(userId);
      account = newAccount._id;
    }

    const defaultTransaction = {
      amount: 100,
      type: "expense",
      description: "Test Transaction",
      date: new Date(),
      user: userId,
      category,
      account,
      ...overrides,
    };

    return await Transaction.create(defaultTransaction);
  }

  static async createGoal(userId: string, overrides: any = {}) {
    const defaultGoal = {
      name: "Test Goal",
      targetAmount: 1000,
      currentAmount: 0,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      user: userId,
      ...overrides,
    };

    return await Goal.create(defaultGoal);
  }

  static async createAccount(userId: string, overrides: any = {}) {
    const defaultAccount = {
      name: "Test Account",
      type: "checking",
      balance: 0,
      institution: "Test Bank",
      user: userId,
      ...overrides,
    };

    return await Account.create(defaultAccount);
  }

  static async createCreditCard(userId: string, overrides: any = {}) {
    // Gerar últimos 4 dígitos únicos para o cartão
    const randomLast4Digits = Math.floor(
      Math.random() * 9000 + 1000
    ).toString();
    const defaultCreditCard = {
      cardNumber: randomLast4Digits,
      cardBrand: "visa",
      cardholderName: "Test User",
      cardholderCpf: "12345678901",
      expiryDate: "12/25",
      securityCode: "123",
      creditLimit: 5000,
      billingDueDay: 15,
      user: userId,
      ...overrides,
    };

    return await CreditCard.create(defaultCreditCard);
  }

  static async createInvestment(
    userId: string,
    accountId?: string,
    overrides: any = {}
  ): Promise<any> {
    const defaultInvestment = {
      name: "Test Investment",
      type: "stock",
      symbol: "TEST",
      amount: 1000,
      initialValue: 1000,
      currentValue: 1000,
      acquisitionDate: new Date(),
      account: accountId,
      user: userId,
      ...overrides,
    };

    return await Investment.create(defaultInvestment);
  }

  static async createSubscription(userId: string, overrides: any = {}) {
    const defaultSubscription = {
      user: userId,
      planType: "free",
      status: "trial",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ...overrides,
    };

    return await Subscription.create(defaultSubscription);
  }

  static async createCompleteUserData(userId: string): Promise<any> {
    const category = await this.createCategory(userId);
    const account = await this.createAccount(userId);
    const goal = await this.createGoal(userId);
    const creditCard = await this.createCreditCard(userId);
    const investment = await this.createInvestment(userId);
    const subscription = await this.createSubscription(userId);

    // Criar transações variadas
    await this.createTransaction(userId, {
      amount: 5000,
      type: "income",
      description: "Salary",
    });
    await this.createTransaction(userId, {
      amount: 2000,
      type: "expense",
      description: "Food",
      category: category._id,
    });
    await this.createTransaction(userId, {
      amount: 1000,
      type: "expense",
      description: "Transport",
    });

    return {
      user: { _id: userId },
      category,
      account,
      goal,
      creditCard,
      investment,
      subscription,
    };
  }
}

export class TestAuthHelper {
  static async createAuthenticatedUser() {
    const user = await TestDataFactory.createUser();
    return user;
  }

  static getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
}

export class TestApiHelper {
  static expectSuccessResponse(response: any, expectedData?: any) {
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();

    if (expectedData) {
      expect(response.body.data).toMatchObject(expectedData);
    }
  }

  static expectErrorResponse(
    response: any,
    statusCode: number,
    message?: string
  ) {
    expect(response.status).toBe(statusCode);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();

    if (message) {
      expect(response.body.error.message).toContain(message);
    }
  }

  static expectValidationError(response: any) {
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  }

  static expectUnauthorizedError(response: any) {
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  }

  static expectNotFoundError(response: any) {
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  }
}

export class TestMockHelper {
  static mockJwtVerify(token: string, payload: any) {
    const jwt = require("jsonwebtoken");
    jest.spyOn(jwt, "verify").mockReturnValue(payload);
  }

  static mockBcryptCompare(password: string, hash: string, result: boolean) {
    const bcrypt = require("bcrypt");
    jest.spyOn(bcrypt, "compare").mockResolvedValue(result);
  }

  static mockBcryptHash(password: string, hash: string) {
    const bcrypt = require("bcrypt");
    jest.spyOn(bcrypt, "hash").mockResolvedValue(hash);
  }

  static mockMongooseModel(modelName: string, mockData: any) {
    const mockModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      create: jest.fn().mockResolvedValue(mockData),
      save: jest.fn().mockResolvedValue(mockData),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(1),
      aggregate: jest.fn().mockResolvedValue([]),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockData),
    };

    jest.doMock(`../../models/${modelName}`, () => mockModel);
    return mockModel;
  }

  // Métodos para dados de teste de controllers
  static createAccountData() {
    return {
      name: "Test Account",
      type: "checking",
      balance: 1000,
      institution: "Test Bank",
    };
  }

  static createTransactionData() {
    return {
      amount: 500,
      description: "Test Transaction",
      type: "expense",
      date: new Date(),
    };
  }

  static createSpendingInsights() {
    return [
      {
        type: "spending",
        title: "High Food Expenses",
        description: "You're spending more on food than average",
        potentialSavings: 200,
      },
    ];
  }

  static createSavingsInsights() {
    return [
      {
        type: "savings",
        title: "Emergency Fund Progress",
        description: "You're making good progress on your emergency fund",
        potentialSavings: 0,
      },
    ];
  }

  static createGoalInsights() {
    return [
      {
        type: "goal",
        title: "Goal Achievement",
        description: "You're on track to achieve your financial goals",
        potentialSavings: 0,
      },
    ];
  }

  static createInvestmentInsights() {
    return [
      {
        type: "investment",
        title: "Portfolio Performance",
        description: "Your investments are performing well",
        potentialSavings: 0,
      },
    ];
  }

  static createFinancialScore() {
    return {
      score: 75,
      level: "good",
      change: 5,
    };
  }

  static createRecommendations() {
    return [
      {
        type: "budget",
        title: "Create a Budget",
        description: "Set up a monthly budget to track expenses",
        priority: "high",
      },
    ];
  }

  static createTrendAnalysis() {
    return {
      monthlyData: [{ month: "2024-01", income: 5000, expenses: 2000 }],
      goalProgress: 0.5,
    };
  }
}

export class TestTimeHelper {
  static getDate(daysOffset: number = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
  }

  static getDateString(daysOffset: number = 0) {
    return this.getDate(daysOffset).toISOString();
  }

  static getMonthStart() {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  static getMonthEnd() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 0);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  static createSpendingInsights() {
    return [
      {
        type: "spending",
        title: "High Food Expenses",
        description: "You're spending more on food than average",
        potentialSavings: 200,
      },
    ];
  }

  static createSavingsInsights() {
    return [
      {
        type: "savings",
        title: "Emergency Fund Progress",
        description: "You're making good progress on your emergency fund",
        potentialSavings: 0,
      },
    ];
  }

  static createGoalInsights() {
    return [
      {
        type: "goal",
        title: "Goal Achievement",
        description: "You're on track to achieve your financial goals",
        potentialSavings: 0,
      },
    ];
  }

  static createInvestmentInsights() {
    return [
      {
        type: "investment",
        title: "Portfolio Performance",
        description: "Your investments are performing well",
        potentialSavings: 0,
      },
    ];
  }

  static createFinancialScore() {
    return {
      score: 75,
      level: "good",
      change: 5,
    };
  }

  static createRecommendations() {
    return [
      {
        type: "budget",
        title: "Create a Budget",
        description: "Set up a monthly budget to track expenses",
        priority: "high",
      },
    ];
  }

  static createTrendAnalysis() {
    return {
      monthlyData: [{ month: "2024-01", income: 5000, expenses: 2000 }],
      goalProgress: 0.5,
    };
  }
}
