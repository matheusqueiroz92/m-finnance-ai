import { injectable } from "tsyringe";
import jwt from "jsonwebtoken";
import { IUser, IUserDTO } from "../interfaces/entities/IUser";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  type: "access" | "refresh";
}

@injectable()
export class TokenService {
  private readonly ACCESS_TOKEN_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private readonly REFRESH_TOKEN_SECRET =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
  private readonly ACCESS_TOKEN_EXPIRES_IN = "15m";
  private readonly REFRESH_TOKEN_EXPIRES_IN = "7d";

  /**
   * Gera um par de tokens (access + refresh)
   */
  generateTokenPair(user: IUser | IUserDTO): TokenPair {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  /**
   * Gera access token (curta duração)
   */
  generateAccessToken(user: IUser | IUserDTO): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: "access",
    };

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: "m-finnance-ai",
      audience: "m-finnance-ai-client",
    });
  }

  /**
   * Gera refresh token (longa duração)
   */
  generateRefreshToken(user: IUser | IUserDTO): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: "refresh",
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: "m-finnance-ai",
      audience: "m-finnance-ai-client",
    });
  }

  /**
   * Verifica e decodifica access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        this.ACCESS_TOKEN_SECRET
      ) as TokenPayload;

      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      console.error("Access token verification failed:", error);
      return null;
    }
  }

  /**
   * Verifica e decodifica refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        this.REFRESH_TOKEN_SECRET
      ) as TokenPayload;

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }

  /**
   * Renova access token usando refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
    userService: any
  ): Promise<{ accessToken: string; user: IUser } | null> {
    const payload = this.verifyRefreshToken(refreshToken);

    if (!payload) {
      return null;
    }

    try {
      // Buscar usuário atualizado
      const user = await userService.getUserById(payload.userId);
      if (!user) {
        return null;
      }

      // Gerar novo access token
      const newAccessToken = this.generateAccessToken(user);

      return { accessToken: newAccessToken, user };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  }

  /**
   * Verifica se o token está próximo do vencimento
   */
  isTokenNearExpiry(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiry = decoded.exp;
      const timeUntilExpiry = expiry - now;

      // Considera próximo do vencimento se restam menos de 5 minutos
      return timeUntilExpiry < 300;
    } catch (error) {
      return true;
    }
  }
}
