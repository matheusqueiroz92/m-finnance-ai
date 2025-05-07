import { ClientSession } from 'mongoose';

export interface IBaseRepository<T, ID> {
  create(entity: Partial<T>, options?: { session?: ClientSession }): Promise<T>;
  findById(id: ID, options?: { [key: string]: any }): Promise<T | null>;
  findAll(options?: { [key: string]: any }): Promise<T[]>;
  update(id: ID, entity: Partial<T>, options?: { [key: string]: any }): Promise<T | null>;
  delete(id: ID, options?: { [key: string]: any }): Promise<boolean>;
}