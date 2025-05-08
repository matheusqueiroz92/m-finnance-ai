import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../interfaces/entities/IUser';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    dateOfBirth: {
      type: Date,
    },
    cpf: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function(v: string | null | undefined) {
          // Se for undefined ou null, retorna true (válido)
          if (v === undefined || v === null) return true;
          // Se for string vazia, retorna false (inválido)
          if (v === '') return false;
          // Adicione aqui validação de CPF se necessário
          return true;
        },
        message: 'CPF inválido ou vazio'
      }
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: 'pt-BR',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    newsletterEnabled: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    socialProfiles: [{
      provider: {
        type: String,
        required: true,
        enum: ['google', 'facebook', 'github']
      },
      providerId: {
        type: String,
        required: true
      }
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static methods
userSchema.statics.findByEmail = async function(email: string): Promise<IUser | null> {
  return this.findOne({ email });
};

userSchema.statics.create = async function(userData: Partial<IUser>): Promise<IUser> {
  return this.create(userData);
};

userSchema.statics.updateById = async function(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
  return this.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

userSchema.statics.deleteById = async function(id: string): Promise<boolean> {
  const result = await this.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

export const UserModel = model<IUser>('User', userSchema);