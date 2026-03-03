import { injectable } from "tsyringe";
import mongoose from "mongoose";
import { ConsultantSessionModel } from "../schemas/ConsultantSessionSchema";
import { ConsultantSessionMessageModel } from "../schemas/ConsultantSessionMessageSchema";
import {
  IConsultantSessionRepository,
  SessionWithMessages,
} from "../interfaces/repositories/IConsultantSessionRepository";
import { IConsultantSession } from "../interfaces/entities/IConsultantSession";

@injectable()
export class ConsultantSessionRepository implements IConsultantSessionRepository {
  async create(userId: string, title = "Nova conversa"): Promise<IConsultantSession> {
    const session = new ConsultantSessionModel({ user: userId, title });
    return await session.save();
  }

  async findByUser(userId: string): Promise<IConsultantSession[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    return await ConsultantSessionModel.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async findById(
    sessionId: string,
    userId: string
  ): Promise<IConsultantSession | null> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return null;
    return await ConsultantSessionModel.findOne({
      _id: sessionId,
      user: userId,
    }).lean();
  }

  async findByIdWithMessages(
    sessionId: string,
    userId: string
  ): Promise<SessionWithMessages | null> {
    const session = await this.findById(sessionId, userId);
    if (!session) return null;

    const messages = await ConsultantSessionMessageModel.find({
      session: sessionId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return {
      _id: session._id,
      user: session.user,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  }

  async addMessage(
    sessionId: string,
    userId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<boolean> {
    const session = await this.findById(sessionId, userId);
    if (!session) return false;

    await ConsultantSessionMessageModel.create({
      session: sessionId,
      role,
      content,
    });

    await ConsultantSessionModel.updateOne(
      { _id: sessionId, user: userId },
      { $set: { updatedAt: new Date() } }
    );
    return true;
  }

  async updateTitle(
    sessionId: string,
    userId: string,
    title: string
  ): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return false;
    const result = await ConsultantSessionModel.updateOne(
      { _id: sessionId, user: userId },
      { $set: { title: title.trim(), updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async delete(sessionId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return false;
    await ConsultantSessionMessageModel.deleteMany({ session: sessionId });
    const result = await ConsultantSessionModel.deleteOne({
      _id: sessionId,
      user: userId,
    });
    return result.deletedCount > 0;
  }
}
