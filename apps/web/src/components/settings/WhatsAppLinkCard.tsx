"use client";

import React from "react";
import { MessageCircle, CheckCircle, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WhatsAppLinkCardProps {
  phone?: string | null;
  isDark?: boolean;
}

export function WhatsAppLinkCard({ phone, isDark }: WhatsAppLinkCardProps) {
  const hasPhone = Boolean(phone && phone.trim());

  return (
    <Card
      className={`border shadow transition-colors duration-200 ${
        isDark
          ? "bg-white/10 backdrop-blur-sm border-white/20"
          : "bg-white border-gray-200"
      }`}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle
            className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
          />
          <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
            Vincular WhatsApp
          </CardTitle>
        </div>
        <CardDescription
          className={isDark ? "text-zinc-400" : "text-gray-500"}
        >
          Use o campo &quot;Telefone&quot; acima com o mesmo número do seu
          WhatsApp (formato: +55 DDD número) para registrar despesas pelo
          WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasPhone ? (
          <div
            className={`flex items-center gap-2 rounded-lg border p-3 ${
              isDark
                ? "border-emerald-700/50 bg-emerald-900/20 text-emerald-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <CheckCircle
              className={`h-5 w-5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
            />
            <div>
              <p
                className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Número vinculado
              </p>
              <p
                className={`text-sm ${isDark ? "text-zinc-300" : "text-gray-600"}`}
              >
                {phone}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-start gap-2 rounded-lg border p-3 ${
              isDark
                ? "border-amber-700/50 bg-amber-900/20 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <Info
              className={`h-5 w-5 shrink-0 mt-0.5 ${isDark ? "text-amber-400" : "text-amber-600"}`}
            />
            <div>
              <p
                className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Nenhum número vinculado
              </p>
              <p
                className={`text-sm ${isDark ? "text-zinc-300" : "text-gray-600"}`}
              >
                Preencha o campo Telefone no formulário acima (ex: +5511999999999)
                e salve para ativar o envio de despesas pelo WhatsApp.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
