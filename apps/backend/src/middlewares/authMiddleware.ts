import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel';
import { ApiError } from '../utils/ApiError';

interface TokenPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    next(new ApiError('Not authorized, no token', 401));
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      next(new ApiError('Not authorized, user not found', 401));
      return;
    }

    next();
  } catch (error) {
    next(new ApiError('Not authorized, token failed', 401));
  }
};