export interface ConsultantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConsultantReply {
  reply: string;
  sessionId?: string;
}

export interface ConsultantSession {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultantSessionWithMessages extends ConsultantSession {
  messages: { role: "user" | "assistant"; content: string; createdAt: string }[];
}
