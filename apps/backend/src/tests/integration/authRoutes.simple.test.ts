import request from "supertest";
import mongoose from "mongoose";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import app from "../../app";
import { UserModel as User } from "../../schemas/UserSchema";

describe("Auth Routes Integration (Simple)", () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.cleanup();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    testUser = await TestDataFactory.createUser();
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const loginData = {
        email: testUser.email,
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user.email).toBe(loginData.email);

      authToken = response.body.data.token;
    });

    it("should return 401 for invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 for invalid password", async () => {
      const loginData = {
        email: testUser.email,
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/profile", () => {
    beforeEach(async () => {
      // Login para obter token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "password123",
      });

      authToken = loginResponse.body.data.token;
    });

    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data).toHaveProperty("name");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/auth/profile", () => {
    beforeEach(async () => {
      // Login para obter token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "password123",
      });

      authToken = loginResponse.body.data.token;
    });

    it("should update user profile", async () => {
      const updateData = {
        name: "Updated Name",
        language: "en-US",
      };

      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.language).toBe(updateData.language);
    });

    it("should return 400 for invalid data", async () => {
      const invalidData = {
        email: "invalid-email",
      };

      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const updateData = {
        name: "Updated Name",
      };

      const response = await request(app)
        .put("/api/auth/profile")
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/change-password", () => {
    beforeEach(async () => {
      // Login para obter token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "password123",
      });

      authToken = loginResponse.body.data.token;
    });

    it("should change password with valid current password", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newpassword123",
      };

      const response = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 400 for invalid current password", async () => {
      const passwordData = {
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
      };

      const response = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for weak new password", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "123",
      };

      const response = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newpassword123",
      };

      const response = await request(app)
        .post("/api/auth/change-password")
        .send(passwordData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Social Auth Routes", () => {
    it("should redirect to Google OAuth", async () => {
      const response = await request(app).get("/api/auth/google");

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain("accounts.google.com");
    });

    it("should redirect to GitHub OAuth", async () => {
      const response = await request(app).get("/api/auth/github");

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain("github.com");
    });

    it("should handle Google callback with error", async () => {
      const response = await request(app).get(
        "/api/auth/google/callback?error=access_denied"
      );

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain(
        "login?error=callback_failed"
      );
    });

    it("should handle GitHub callback with error", async () => {
      const response = await request(app).get(
        "/api/auth/github/callback?error=access_denied"
      );

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain(
        "login?error=callback_failed"
      );
    });
  });
});
