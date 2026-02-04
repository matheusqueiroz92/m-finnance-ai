import {
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from "../../utils/ApiError";

describe("ApiError", () => {
  describe("ApiError", () => {
    it("should create an ApiError with default values", () => {
      const error = new ApiError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("ApiError");
      expect(error.stack).toBeDefined();
    });

    it("should create an ApiError with custom status code", () => {
      const error = new ApiError("Test error", 400);

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("ApiError");
    });

    it("should create an ApiError with errors array", () => {
      const errors = [
        { field: "email", message: "Invalid email" },
        { field: "password", message: "Password too short" },
      ];
      const error = new ApiError("Validation failed", 400, errors);

      expect(error.message).toBe("Validation failed");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("ApiError");
    });

    it("should be an instance of Error", () => {
      const error = new ApiError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
    });

    it("should capture stack trace", () => {
      const error = new ApiError("Test error");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack).toContain("ApiError");
    });
  });

  describe("NotFoundError", () => {
    it("should create a NotFoundError with default message", () => {
      const error = new NotFoundError();

      expect(error.message).toBe("Recurso não encontrado");
      expect(error.statusCode).toBe(404);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("NotFoundError");
    });

    it("should create a NotFoundError with custom message", () => {
      const error = new NotFoundError("User not found");

      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("NotFoundError");
    });

    it("should create a NotFoundError with errors array", () => {
      const errors = [{ resource: "user", id: "123" }];
      const error = new NotFoundError("User not found", errors);

      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("NotFoundError");
    });

    it("should be an instance of ApiError", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe("ValidationError", () => {
    it("should create a ValidationError with default message", () => {
      const error = new ValidationError();

      expect(error.message).toBe("Erro de validação");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("ValidationError");
    });

    it("should create a ValidationError with custom message", () => {
      const error = new ValidationError("Invalid input data");

      expect(error.message).toBe("Invalid input data");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("ValidationError");
    });

    it("should create a ValidationError with errors array", () => {
      const errors = [
        { field: "email", message: "Invalid email format" },
        { field: "age", message: "Age must be a number" },
      ];
      const error = new ValidationError("Validation failed", errors);

      expect(error.message).toBe("Validation failed");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("ValidationError");
    });

    it("should be an instance of ApiError", () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe("UnauthorizedError", () => {
    it("should create an UnauthorizedError with default message", () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe("Não autorizado");
      expect(error.statusCode).toBe(401);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should create an UnauthorizedError with custom message", () => {
      const error = new UnauthorizedError("Invalid credentials");

      expect(error.message).toBe("Invalid credentials");
      expect(error.statusCode).toBe(401);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should create an UnauthorizedError with errors array", () => {
      const errors = [{ issue: "token", message: "Token expired" }];
      const error = new UnauthorizedError("Authentication failed", errors);

      expect(error.message).toBe("Authentication failed");
      expect(error.statusCode).toBe(401);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should be an instance of ApiError", () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(UnauthorizedError);
    });
  });

  describe("ForbiddenError", () => {
    it("should create a ForbiddenError with default message", () => {
      const error = new ForbiddenError();

      expect(error.message).toBe("Acesso negado");
      expect(error.statusCode).toBe(403);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("ForbiddenError");
    });

    it("should create a ForbiddenError with custom message", () => {
      const error = new ForbiddenError("Insufficient permissions");

      expect(error.message).toBe("Insufficient permissions");
      expect(error.statusCode).toBe(403);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("ForbiddenError");
    });

    it("should create a ForbiddenError with errors array", () => {
      const errors = [{ resource: "admin", action: "delete" }];
      const error = new ForbiddenError("Access denied", errors);

      expect(error.message).toBe("Access denied");
      expect(error.statusCode).toBe(403);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("ForbiddenError");
    });

    it("should be an instance of ApiError", () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(ForbiddenError);
    });
  });

  describe("InternalServerError", () => {
    it("should create an InternalServerError with default message", () => {
      const error = new InternalServerError();

      expect(error.message).toBe("Erro interno do servidor");
      expect(error.statusCode).toBe(500);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("InternalServerError");
    });

    it("should create an InternalServerError with custom message", () => {
      const error = new InternalServerError("Database connection failed");

      expect(error.message).toBe("Database connection failed");
      expect(error.statusCode).toBe(500);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe("InternalServerError");
    });

    it("should create an InternalServerError with errors array", () => {
      const errors = [{ component: "database", message: "Connection timeout" }];
      const error = new InternalServerError("System error", errors);

      expect(error.message).toBe("System error");
      expect(error.statusCode).toBe(500);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("InternalServerError");
    });

    it("should be an instance of ApiError", () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(InternalServerError);
    });
  });

  describe("Error inheritance", () => {
    it("should maintain proper inheritance chain", () => {
      const notFoundError = new NotFoundError();
      const validationError = new ValidationError();
      const unauthorizedError = new UnauthorizedError();
      const forbiddenError = new ForbiddenError();
      const internalServerError = new InternalServerError();

      // All should be instances of Error
      expect(notFoundError).toBeInstanceOf(Error);
      expect(validationError).toBeInstanceOf(Error);
      expect(unauthorizedError).toBeInstanceOf(Error);
      expect(forbiddenError).toBeInstanceOf(Error);
      expect(internalServerError).toBeInstanceOf(Error);

      // All should be instances of ApiError
      expect(notFoundError).toBeInstanceOf(ApiError);
      expect(validationError).toBeInstanceOf(ApiError);
      expect(unauthorizedError).toBeInstanceOf(ApiError);
      expect(forbiddenError).toBeInstanceOf(ApiError);
      expect(internalServerError).toBeInstanceOf(ApiError);

      // Each should be an instance of its specific class
      expect(notFoundError).toBeInstanceOf(NotFoundError);
      expect(validationError).toBeInstanceOf(ValidationError);
      expect(unauthorizedError).toBeInstanceOf(UnauthorizedError);
      expect(forbiddenError).toBeInstanceOf(ForbiddenError);
      expect(internalServerError).toBeInstanceOf(InternalServerError);
    });

    it("should have correct status codes", () => {
      expect(new NotFoundError().statusCode).toBe(404);
      expect(new ValidationError().statusCode).toBe(400);
      expect(new UnauthorizedError().statusCode).toBe(401);
      expect(new ForbiddenError().statusCode).toBe(403);
      expect(new InternalServerError().statusCode).toBe(500);
    });
  });

  describe("Error throwing and catching", () => {
    it("should be throwable and catchable", () => {
      expect(() => {
        throw new ApiError("Test error", 400);
      }).toThrow(ApiError);

      expect(() => {
        throw new NotFoundError("Not found");
      }).toThrow(NotFoundError);

      expect(() => {
        throw new ValidationError("Invalid data");
      }).toThrow(ValidationError);
    });

    it("should preserve error properties when thrown and caught", () => {
      try {
        throw new ValidationError("Invalid input", [
          { field: "email", message: "Invalid format" },
        ]);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe("Invalid input");
        expect((error as ValidationError).statusCode).toBe(400);
        expect((error as ValidationError).errors).toEqual([
          { field: "email", message: "Invalid format" },
        ]);
      }
    });
  });
});
