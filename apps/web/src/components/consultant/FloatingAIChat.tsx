"use client";

import React, { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { MessageList } from "./MessageList";
import { ConsultantInput } from "./ConsultantInput";
import { sendConsultantMessage } from "@/services/consultantService";
import type { ConsultantMessage } from "@/types/consultant";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 520;

export function FloatingAIChat() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ConsultantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useUserContext, setUseUserContext] = useState(true);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: ConsultantMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const history = messages.slice(-20);
        const { reply } = await sendConsultantMessage({
          message: content,
          history,
          useUserContext,
        });
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
    },
    [messages, useUserContext]
  );

  return (
    <>
      <Button
        type="button"
        size="icon"
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
        aria-label={isOpen ? "Fechar chat" : "Abrir consultor"}
      >
        <Bot className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div
          className="fixed z-40 flex flex-col rounded-xl border shadow-xl overflow-hidden transition-all"
          style={{
            bottom: 88,
            right: 24,
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            backgroundColor: isDark ? "rgba(30, 41, 59, 0.98)" : "white",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b bg-emerald-600/10">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-sm">Consultor IA</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0">
            <Switch
              id="floating-use-context"
              checked={useUserContext}
              onCheckedChange={setUseUserContext}
            />
            <Label
              htmlFor="floating-use-context"
              className="text-sm cursor-pointer"
            >
              Usar meus dados
            </Label>
          </div>
          <p className="text-xs text-muted-foreground px-4 pb-2 flex-shrink-0">
            {useUserContext
              ? "Respostas com base nas suas transações e metas."
              : "Dicas gerais de educação financeira."}
          </p>

          <div className="flex-1 min-h-0 flex flex-col">
            <MessageList messages={messages} />
            <ConsultantInput onSend={handleSend} disabled={isLoading} />
          </div>
        </div>
      )}
    </>
  );
}
