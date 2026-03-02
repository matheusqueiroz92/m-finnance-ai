"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageAuth from "@/components/auth/PageAuth";
import LoginForm from "@/components/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [showVerifiedAlert, setShowVerifiedAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setShowVerifiedAlert(true);
      setTimeout(() => setShowVerifiedAlert(false), 5000);
    }
  }, [searchParams]);

  return (
    <>
      {showVerifiedAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              E-mail verificado com sucesso! Faça login para continuar.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <PageAuth
        title="Bem-vindo de volta!"
        subtitle="Entre para continuar gerenciando suas finanças"
        formComponent={<LoginForm />}
        footerText="Não tem uma conta?"
        footerLinkText="Cadastre-se"
        footerLinkHref="/register"
        showSocialLogin={true}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
