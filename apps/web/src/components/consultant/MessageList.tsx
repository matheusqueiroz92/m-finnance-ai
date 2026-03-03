"use client";

import React, { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { User, Bot } from "lucide-react";
import type { ConsultantMessage } from "@/types/consultant";

interface MessageListProps {
  messages: ConsultantMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-muted-foreground">
        <Bot className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">
          Faça uma pergunta sobre suas finanças. O consultor usa seus dados de
          transações e metas para responder.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "assistant" && (
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? "bg-emerald-600" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Bot className="h-4 w-4" />
            </div>
          )}
          <div
            className={`max-w-[85%] rounded-lg px-4 py-2 ${
              msg.role === "user"
                ? isDark
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-600 text-white"
                : isDark
                  ? "bg-white/10 text-gray-100"
                  : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
          {msg.role === "user" && (
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? "bg-blue-600" : "bg-blue-100 text-blue-700"
              }`}
            >
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
