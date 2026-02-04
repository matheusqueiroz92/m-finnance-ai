import "reflect-metadata";
import { TestDatabase } from "./utils/testHelpers";

// Setup for all tests
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";

  // Setup test database
  await TestDatabase.setup();
});

// Cleanup after all tests
afterAll(async () => {
  await TestDatabase.teardown();
});

// Clean up database between tests
beforeEach(async () => {
  await TestDatabase.cleanup();
});

// Global test timeout
jest.setTimeout(30000);
