"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { MessageList } from "./MessageList";
import { ConsultantInput } from "./ConsultantInput";
import { sendConsultantMessage } from "@/services/consultantService";
import type { ConsultantMessage } from "@/types/consultant";
import { Bot } from "lucide-react";

export function ConsultantChat() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messages, setMessages] = useState<ConsultantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async (content: string) => {
    const userMessage: ConsultantMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.slice(-20);
      const { reply } = await sendConsultantMessage(content, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Não foi possível obter resposta. Verifique sua conexão e tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <Card
      className={`flex flex-col h-[600px] border shadow ${
        isDark
          ? "bg-white/10 backdrop-blur-sm border-white/20"
          : "bg-white border-gray-200"
      }`}
    >
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-emerald-500" />
          Consultor Financeiro
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Respostas personalizadas com base nas suas transações e metas
        </p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <MessageList messages={messages} />
        <ConsultantInput onSend={handleSend} disabled={isLoading} />
      </CardContent>
    </Card>
  );
}
