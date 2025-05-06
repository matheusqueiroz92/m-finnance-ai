import mongoose, { ClientSession } from 'mongoose';

export class TransactionManager {
  /**
   * Executa uma função dentro de uma transação do MongoDB
   * @param callback Função a ser executada na transação
   */
  static async executeInTransaction<T>(
    callback: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}