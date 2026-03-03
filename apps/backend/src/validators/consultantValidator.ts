import { z } from "zod";

export const consultantChatSchema = z.object({
  message: z.string().min(1, "A mensagem não pode estar vazia").max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  useUserContext: z.boolean().optional().default(true),
});

export type ConsultantChatInput = z.infer<typeof consultantChatSchema>;
