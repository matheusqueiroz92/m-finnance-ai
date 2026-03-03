"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ConsultantInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ConsultantInput({ onSend, disabled }: ConsultantInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Pergunte sobre seu score, metas, gastos..."
        className="min-h-[44px] max-h-32 resize-none"
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button
        type="submit"
        size="icon"
        className="flex-shrink-0 h-11 w-11 bg-emerald-600 hover:bg-emerald-700"
        disabled={disabled || !value.trim()}
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Enviar</span>
      </Button>
    </form>
  );
}
