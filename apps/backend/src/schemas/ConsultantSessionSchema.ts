import { Schema, model } from "mongoose";
import { IConsultantSession } from "../interfaces/entities/IConsultantSession";

const consultantSessionSchema = new Schema<IConsultantSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Nova conversa",
      trim: true,
    },
  },
  { timestamps: true }
);

consultantSessionSchema.index({ user: 1, createdAt: -1 });

export const ConsultantSessionModel = model<IConsultantSession>(
  "ConsultantSession",
  consultantSessionSchema
);
