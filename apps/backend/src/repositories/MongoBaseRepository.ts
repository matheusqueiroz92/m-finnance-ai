import mongoose, { Model, Document, ClientSession } from 'mongoose';
import { IBaseRepository } from '../interfaces/repositories/IBaseRepository';

export abstract class MongoBaseRepository<T extends Document, ID = string> implements IBaseRepository<T, ID> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(entity: Partial<T>, options?: { session?: ClientSession }): Promise<T> {
    const createdEntities = await this.model.create([entity], options ? { session: options.session } : {});
    return createdEntities[0] as T;
  }

  async findById(id: ID, options?: { [key: string]: any }): Promise<T | null> {
    if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id as string)) {
      return null;
    }
    
    let query: any = { _id: id };
    if (options && options.userId) {
      query.user = options.userId;
    }
    
    return await this.model.findOne(query);
  }

  async findAll(options?: { [key: string]: any }): Promise<T[]> {
    const query = this.buildQuery(options);
    const limit = options?.limit || 0;
    const skip = options?.skip || 0;
    const sort = options?.sort || {};
    
    return await this.model.find(query).sort(sort).skip(skip).limit(limit);
  }

  async update(id: ID, entity: Partial<T>, options?: { [key: string]: any }): Promise<T | null> {
    if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id as string)) {
      return null;
    }
    
    let query: any = { _id: id };
    if (options && options.userId) {
      query.user = options.userId;
    }
    
    return await this.model.findOneAndUpdate(
      query,
      entity,
      { 
        new: true, 
        runValidators: true,
        ...(options?.session ? { session: options.session } : {})
      }
    );
  }

  async delete(id: ID, options?: { [key: string]: any }): Promise<boolean> {
    if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id as string)) {
      return false;
    }
    
    let query: any = { _id: id };
    if (options && options.userId) {
      query.user = options.userId;
    }
    
    const result = await this.model.deleteOne(
      query,
      options?.session ? { session: options.session } : {}
    );
    
    return result.deletedCount > 0;
  }
  
  protected buildQuery(options?: { [key: string]: any }): any {
    if (!options) return {};
    
    const query: any = {};
    
    if (options.userId) {
      query.user = options.userId;
    }
    
    return query;
  }
}