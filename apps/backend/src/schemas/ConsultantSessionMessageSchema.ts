import { Schema, model } from "mongoose";
import { IConsultantSessionMessageDoc } from "../interfaces/entities/IConsultantSession";

const consultantSessionMessageSchema = new Schema<IConsultantSessionMessageDoc>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "ConsultantSession",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

consultantSessionMessageSchema.index({ session: 1, createdAt: 1 });

export const ConsultantSessionMessageModel = model<IConsultantSessionMessageDoc>(
  "ConsultantSessionMessage",
  consultantSessionMessageSchema
);
