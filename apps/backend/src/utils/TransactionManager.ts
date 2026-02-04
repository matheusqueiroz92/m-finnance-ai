import mongoose, { ClientSession } from "mongoose";

export class TransactionManager {
  /**
   * Execute a callback function within a MongoDB transaction
   * @param callback Função a ser executada na transação
   * @returns A promise that resolves to the result of the callback function
   */
  static async executeInTransaction<T>(
    callback: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    // Em ambiente de teste ou quando transações não são suportadas,
    // executa a função sem transação
    if (
      process.env.NODE_ENV === "test" ||
      process.env.MONGODB_URL?.includes("localhost")
    ) {
      return await callback(null as any);
    }

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
