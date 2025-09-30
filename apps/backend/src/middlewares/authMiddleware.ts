import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../schemas/UserSchema";
import { ApiError } from "../utils/ApiError";

interface TokenPayload {
  id?: string;
  userId?: string;
  email: string;
  type: string;
}

// Removido - usando types/express.d.ts

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    next(new ApiError("Not authorized, no token", 401));
    return;
  }

  try {
    // Verificar que JWT_SECRET está definido
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET não está definido no ambiente");
      next(new ApiError("Server configuration error", 500));
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Get user ID from token (support both id and userId)
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      next(new ApiError("Not authorized, invalid token payload", 401));
      return;
    }

    // Get user from token
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      next(new ApiError("Not authorized, user not found", 401));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    next(new ApiError("Not authorized, token failed", 401));
  }
};
