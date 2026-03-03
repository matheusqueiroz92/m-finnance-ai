"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { MessageList } from "./MessageList";
import { ConsultantInput } from "./ConsultantInput";
import {
  sendConsultantMessage,
  createConsultantSession,
  getConsultantSessions,
  getConsultantSession,
} from "@/services/consultantService";
import type {
  ConsultantMessage,
  ConsultantSession,
} from "@/types/consultant";
import { Bot, MessageSquarePlus, Loader2 } from "lucide-react";

export function ConsultantChat() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConsultantMessage[]>([]);
  const [sessions, setSessions] = useState<ConsultantSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const list = await getConsultantSessions();
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleNewConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      const { sessionId: newId } = await createConsultantSession();
      setSessionId(newId);
      setMessages([]);
      await loadSessions();
    } finally {
      setIsLoading(false);
    }
  }, [loadSessions]);

  const handleSelectSession = useCallback(
    async (id: string) => {
      if (id === sessionId) return;
      setIsLoading(true);
      try {
        const session = await getConsultantSession(id);
        setSessionId(session._id);
        setMessages(
          session.messages.map((m) => ({ role: m.role, content: m.content }))
        );
      } catch {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: ConsultantMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const history = messages.slice(-20);
        const result = await sendConsultantMessage({
          message: content,
          history,
          sessionId: sessionId ?? undefined,
        });
        if (result.sessionId) setSessionId(result.sessionId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.reply },
        ]);
        if (!sessionId && result.sessionId) await loadSessions();
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
    [messages, sessionId, loadSessions]
  );

  return (
    <Card
      className={`flex flex-col h-[600px] border shadow ${
        isDark
          ? "bg-white/10 backdrop-blur-sm border-white/20"
          : "bg-white border-gray-200"
      }`}
    >
      <CardHeader className="flex-shrink-0 border-b space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-emerald-500" />
            Consultor Financeiro
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            disabled={isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquarePlus className="h-4 w-4" />
            )}
            Nova conversa
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Respostas personalizadas com base nas suas transações e metas
        </p>
        {sessions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {isLoadingSessions ? (
              <span className="text-xs text-muted-foreground">
                Carregando conversas...
              </span>
            ) : (
              sessions.slice(0, 8).map((s) => (
                <Button
                  key={s._id}
                  type="button"
                  variant={sessionId === s._id ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs max-w-[180px] truncate"
                  onClick={() => handleSelectSession(s._id)}
                  disabled={isLoading}
                >
                  {s.title}
                </Button>
              ))
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <MessageList messages={messages} />
        <ConsultantInput onSend={handleSend} disabled={isLoading} />
      </CardContent>
    </Card>
  );
}
