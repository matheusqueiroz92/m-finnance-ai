"use client";

import { Suspense } from "react";
import PageAuth from "@/components/auth/PageAuth";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <PageAuth
        title="Criar nova senha"
        subtitle="Digite sua nova senha abaixo"
        formComponent={<ResetPasswordForm />}
        footerText="Lembrou sua senha?"
        footerLinkText="Voltar ao login"
        footerLinkHref="/login"
        showSocialLogin={false}
      />
    </Suspense>
  );
}
