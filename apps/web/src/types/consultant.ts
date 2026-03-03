export interface ConsultantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConsultantReply {
  reply: string;
}
