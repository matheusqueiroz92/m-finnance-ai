"use client";

import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Mail, AlertCircle } from "lucide-react";
import { resendVerificationEmail } from "@/services/authService";
import { toast } from "sonner";

interface EmailVerificationAlertProps {
  userEmail: string;
  onDismiss?: () => void;
}

export function EmailVerificationAlert({
  userEmail,
  onDismiss,
}: EmailVerificationAlertProps) {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      toast.success("E-mail de verificação reenviado com sucesso!");
    } catch (error) {
      console.error("Erro ao reenviar e-mail:", error);
      toast.error("Erro ao reenviar e-mail. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <AlertTitle className="text-amber-800 dark:text-amber-200">
          Verificação de E-mail Necessária
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300 mt-2">
          <p>
            Seu e-mail <strong>{userEmail}</strong> ainda não foi verificado.
          </p>
          <p className="mt-2">
            Verifique sua caixa de entrada e clique no link de verificação para
            ativar sua conta. Se não recebeu o e-mail, você pode solicitar um
            novo.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isResending ? "Enviando..." : "Reenviar E-mail"}
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
