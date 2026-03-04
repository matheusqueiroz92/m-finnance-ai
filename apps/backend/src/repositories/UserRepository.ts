import { injectable } from "tsyringe";
import mongoose, { ClientSession } from "mongoose";
import { IUser } from "../interfaces/entities/IUser";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { UserModel } from "../schemas/UserSchema";
import bcrypt from "bcrypt";

@injectable()
export class UserRepository implements IUserRepository {
  /**
   * Create a new user
   * @param userData - The data for the new user
   * @param options - The options for the user
   * @returns The created user
   */
  async create(
    userData: Partial<IUser>,
    options?: { session?: ClientSession }
  ): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save(options);
  }

  /**
   * Find a user by email
   * @param email - The email of the user
   * @returns The user
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find a user by phone (WhatsApp format: whatsapp:+5511999999999 or +5511999999999)
   */
  async findByPhone(phone: string): Promise<IUser | null> {
    const cleaned = phone.replace(/^whatsapp:/i, "").trim();
    if (!cleaned) return null;
    return await UserModel.findOne({
      $or: [{ phone: cleaned }, { phone: cleaned.replace(/\D/g, "") }],
    });
  }

  /**
   * Find a user by id
   * @param id - The id of the user
   * @returns The user
   */
  async findById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await UserModel.findById(id);
  }

  /**
   * Find a user by id and update
   * @param id - The id of the user
   * @param updateData - The data to update the user
   * @param options - The options for the user
   * @returns The updated user
   */
  async findByIdAndUpdate(
    id: string,
    updateData: Partial<IUser>,
    options?: { session?: ClientSession }
  ): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  /**
   * Find all users
   * @param page - The page number
   * @param limit - The limit of users per page
   * @param filters - The filters for the users
   * @returns The users and the total number of users
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;

    let query: any = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];

      // Adicionar busca por CPF se for um número
      if (/^\d+$/.test(filters.search)) {
        query.$or.push({ cpf: filters.search });
      }
    }

    const [users, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(query),
    ]);

    return { users, total };
  }

  /**
   * Update a user
   * @param id - The id of the user
   * @param updateData - The data to update the user
   * @param options - The options for the user
   * @returns The updated user
   */
  async update(
    id: string,
    updateData: Partial<IUser>,
    options?: { session?: ClientSession }
  ): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  /**
   * Delete a user
   * @param id - The id of the user
   * @returns The deleted user
   */
  async delete(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await UserModel.findByIdAndDelete(id);
  }

  /**
   * Check if the password is correct
   * @param id - The id of the user
   * @param password - The password to check
   * @returns True if the password is correct, false otherwise
   */
  async checkPassword(id: string, password: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    if (!user) return false;
    return await user.comparePassword(password);
  }

  /**
   * Find a user by email verification token
   * @param token - The email verification token
   * @returns The user
   */
  async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    return await UserModel.findOne({ emailVerificationToken: token });
  }
}
