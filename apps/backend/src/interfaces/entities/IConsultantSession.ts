import { Document, Types } from "mongoose";

export interface IConsultantSessionMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IConsultantSession extends Document {
  user: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConsultantSessionMessageDoc extends Document {
  session: Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
