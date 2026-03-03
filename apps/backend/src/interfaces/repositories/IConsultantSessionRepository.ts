import mongoose from "mongoose";
import { IConsultantSession } from "../entities/IConsultantSession";

export interface SessionMessageDTO {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface SessionWithMessages {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: SessionMessageDTO[];
}

export interface IConsultantSessionRepository {
  create(userId: string, title?: string): Promise<IConsultantSession>;
  findByUser(userId: string): Promise<IConsultantSession[]>;
  findById(sessionId: string, userId: string): Promise<IConsultantSession | null>;
  findByIdWithMessages(
    sessionId: string,
    userId: string
  ): Promise<SessionWithMessages | null>;
  addMessage(
    sessionId: string,
    userId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<boolean>;
  updateTitle(sessionId: string, userId: string, title: string): Promise<boolean>;
  delete(sessionId: string, userId: string): Promise<boolean>;
}
