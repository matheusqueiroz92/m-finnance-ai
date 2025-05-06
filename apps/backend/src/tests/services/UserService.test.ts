import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserService } from '../../services/UserService';
import User from '../../models/UserModel';
import { ApiError } from '../../utils/ApiError';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('UserService', () => {
  const userService = new UserService();
  
  describe('register', () => {
    it('should register a new user and return token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      const result = await userService.register(userData);
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
    });
    
    it('should throw error if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      await userService.register(userData);
      
      await expect(userService.register(userData)).rejects.toThrow(ApiError);
    });
  });
  
  describe('login', () => {
    it('should authenticate user and return token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      await userService.register(userData);
      
      const result = await userService.login(userData.email, userData.password);
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
    });
    
    it('should throw error if email is invalid', async () => {
      await expect(userService.login('invalid@example.com', 'password')).rejects.toThrow(ApiError);
    });
    
    it('should throw error if password is invalid', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      await userService.register(userData);
      
      await expect(userService.login(userData.email, 'wrongpassword')).rejects.toThrow(ApiError);
    });
  });
  
  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      const { user } = await userService.register(userData);
      
      const foundUser = await userService.getUserById(user._id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser._id.toString()).toBe(user._id.toString());
      expect(foundUser.email).toBe(userData.email);
    });
    
    it('should throw error if user not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(userService.getUserById(nonExistentId.toString())).rejects.toThrow(ApiError);
    });
  });
  
  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      const { user } = await userService.register(userData);
      
      const updateData = {
        name: 'Updated Name',
        phone: '123456789',
      };
      
      const updatedUser = await userService.updateProfile(user._id, updateData);
      
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.phone).toBe(updateData.phone);
      expect(updatedUser.email).toBe(userData.email); // Email should not change
    });
    
    it('should throw error if updating to existing email', async () => {
      const user1 = await userService.register({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'password123',
      });
      
      const user2 = await userService.register({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
      });
      
      await expect(userService.updateProfile(user2.user._id, { email: 'user1@example.com' })).rejects.toThrow(ApiError);
    });
  });
});