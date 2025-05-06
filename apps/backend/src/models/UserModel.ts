// import mongoose from 'mongoose';
// import { IUser, IUserModel } from '../interfaces/entities/IUser';
// import { UserModel } from '../schemas/UserSchema';
// import bcrypt from 'bcrypt';

// class UserModelClass implements IUserModel {
//   async create(userData: Partial<IUser>): Promise<IUser> {
//     const user = new UserModel(userData);
//     return await user.save();
//   }

//   async findByEmail(email: string): Promise<IUser | null> {
//     return await UserModel.findOne({ email: email.toLowerCase() });
//   }

//   async findById(id: string): Promise<IUser | null> {
//     if (!mongoose.Types.ObjectId.isValid(id)) return null;
//     return await UserModel.findById(id);
//   }

//   async findByIdAndUpdate(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
//     if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
//     if (updateData.password) {
//       updateData.password = await bcrypt.hash(updateData.password, 10);
//     }
    
//     return await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
//   }

//   async findAll(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ users: IUser[]; total: number }> {
//     const skip = (page - 1) * limit;
    
//     let query: any = {};
    
//     if (filters.role) {
//       query.role = filters.role;
//     }
    
//     if (filters.search) {
//       const searchRegex = new RegExp(filters.search, "i");
//       query.$or = [
//         { name: searchRegex },
//         { email: searchRegex },
//         { phone: searchRegex },
//       ];
      
//       // Adicionar busca por CPF se for um número
//       if (/^\d+$/.test(filters.search)) {
//         query.$or.push({ cpf: filters.search });
//       }
//     }
    
//     const [users, total] = await Promise.all([
//       UserModel.find(query)
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),
//       UserModel.countDocuments(query)
//     ]);
    
//     return { users, total };
//   }

//   async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
//     if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
//     if (updateData.password) {
//       updateData.password = await bcrypt.hash(updateData.password, 10);
//     }
    
//     return await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
//   }

//   async delete(id: string): Promise<IUser | null> {
//     if (!mongoose.Types.ObjectId.isValid(id)) return null;
//     return await UserModel.findByIdAndDelete(id);
//   }

//   async checkPassword(id: string, password: string): Promise<boolean> {
//     const user = await UserModel.findById(id);
//     if (!user) return false;
//     return await user.comparePassword(password);
//   }
// }

// export { UserModel as User, UserModelClass };