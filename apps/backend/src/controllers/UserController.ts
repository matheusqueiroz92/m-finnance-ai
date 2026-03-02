import { Request, Response, NextFunction } from "express";
import { injectable, inject, container } from "tsyringe";
import { IUserService } from "../interfaces/services/IUserService";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { CookieManager } from "../middlewares/cookieMiddleware";
import {
  userRegisterSchema,
  userUpdateSchema,
} from "../validators/userValidator";
import { ICategoryService } from "../interfaces/services/ICategoryService";
import { ZodError } from "zod";
import { IUserRegisterDTO, IUserUpdateDTO } from "../interfaces/entities/IUser";

@injectable()
export class UserController {
  constructor(
    @inject("UserService")
    private userService: IUserService
  ) {}

  /**
   * Register a new user
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the user is registered
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Registro não requer autenticação - usuário ainda não existe
    try {
      // Preparar os dados para validação
      const userData: IUserRegisterDTO = {
        // Especificar o tipo aqui
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        dateOfBirth: req.body.dateOfBirth,
        cpf: req.body.cpf,
        phone: req.body.phone,
        language: req.body.language || "pt-BR",
      };

      // Adicionar avatar se existir - agora fora da validação
      if (req.file) {
        userData.avatar = req.file.path.replace(/\\/g, "/");
      }

      // Validar os dados manualmente
      try {
        // Usar o schema Zod para validação
        const validatedData = userRegisterSchema.parse(userData);

        // Tratar o CPF - se for vazio ou undefined, remove o campo
        if (!validatedData.cpf || validatedData.cpf.trim() === "") {
          delete validatedData.cpf;
        }

        // Registrar usuário (as categorias padrão já são criadas no UserService)
        const result = await this.userService.register(validatedData);

        if (result.token) {
          CookieManager.setToken(res, result.token);
        }
        ApiResponse.created(res, result, "Usuário registrado com sucesso");
      } catch (validationError) {
        // O resto do código permanece igual
      }
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      next(error);
    }
  };

  /**
   * Login user
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the user is logged in
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Login não requer autenticação prévia - usuário está se autenticando

    try {
      if (!req.body.email || !req.body.password) {
        throw new ApiError("Por favor, forneça email e senha", 400);
      }

      const result = await this.userService.login(req.body);

      if (result.token) {
        CookieManager.setToken(res, result.token);
      }
      ApiResponse.success(
        res,
        {
          user: {
            _id: result.user._id,
            name: result.user.name,
            email: result.user.email,
            dateOfBirth: result.user.dateOfBirth,
            cpf: result.user.cpf,
            phone: result.user.phone,
            avatar: result.user.avatar,
            language: result.user.language,
            isPremium: result.user.isPremium,
            isEmailVerified: result.user.isEmailVerified,
            twoFactorEnabled: result.user.twoFactorEnabled,
            newsletterEnabled: result.user.newsletterEnabled,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          token: result.token,
        },
        "Login realizado com sucesso"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user profile
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the user profile is retrieved
   */
  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const user = await this.userService.getUserById((req.user as any)._id);

      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        cpf: user.cpf,
        phone: user.phone,
        avatar: user.avatar,
        language: user.language,
        isPremium: user.isPremium,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        newsletterEnabled: user.newsletterEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      ApiResponse.success(res, responseData, "Perfil recuperado com sucesso");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the user profile is updated
   */
  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      console.log("Dados recebidos para atualização de perfil:", req.body);
      console.log("Avatar recebido:", req.file);

      // Preparar os dados para validação
      const updateData: IUserUpdateDTO = {
        name: req.body.name,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
        phone: req.body.phone,
        language: req.body.language,
        twoFactorEnabled:
          req.body.twoFactorEnabled === "true"
            ? true
            : req.body.twoFactorEnabled === "false"
              ? false
              : undefined,
        newsletterEnabled:
          req.body.newsletterEnabled === "true"
            ? true
            : req.body.newsletterEnabled === "false"
              ? false
              : undefined,
      };

      // Adicionar avatar se existir
      if (req.file) {
        updateData.avatar = req.file.path.replace(/\\/g, "/");
      }

      // Remover campos undefined para não sobrescrever dados existentes
      Object.keys(updateData).forEach((key) => {
        const typedKey = key as keyof IUserUpdateDTO;
        if (updateData[typedKey] === undefined) {
          delete updateData[typedKey];
        }
      });

      console.log("Dados preparados para validação:", updateData);

      // Validar os dados manualmente
      try {
        // Usar o schema Zod para validação
        const validatedData = userUpdateSchema.parse(updateData);

        console.log("Dados finais para atualização de perfil:", validatedData);

        const result = await this.userService.updateProfile(
          (req.user as any)._id,
          validatedData
        );

        ApiResponse.success(res, result, "Perfil atualizado com sucesso");
      } catch (validationError) {
        console.error("Erro de validação:", validationError);

        if (validationError instanceof ZodError) {
          const formattedErrors = validationError.errors.map((err) => ({
            field: err.path.join(".") || "dados",
            message: `Campo ${err.path.join(".") || "desconhecido"}: ${err.message}`,
          }));

          throw new ApiError(
            "Erro de validação dos dados do perfil",
            400,
            formattedErrors
          );
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      next(error);
    }
  };

  /**
   * Change user password
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the user password is changed
   */
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new ApiError(
          "Por favor, forneça a senha atual e a nova senha",
          400
        );
      }

      await this.userService.changePassword((req.user as any)._id, {
        currentPassword,
        newPassword,
      });

      ApiResponse.success(res, null, "Senha alterada com sucesso", 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the email is verified
   */
  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError("Token de verificação é obrigatório", 400);
      }

      await this.userService.verifyEmail(token);

      ApiResponse.success(res, null, "E-mail verificado com sucesso");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email (public route - no authentication required)
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the email is verified
   */
  verifyEmailPublic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError("Token de verificação é obrigatório", 400);
      }

      await this.userService.verifyEmail(token);

      ApiResponse.success(res, null, "E-mail verificado com sucesso");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend verification email
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the verification email is resent
   */
  resendVerificationEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      await this.userService.resendVerificationEmail((req.user as any)._id);

      ApiResponse.success(
        res,
        null,
        "E-mail de verificação reenviado com sucesso"
      );
    } catch (error) {
      next(error);
    }
  };
}
