import PageAuth from '@/components/auth/PageAuth';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <PageAuth
      title="Esqueceu sua senha?"
      subtitle="Digite seu email e enviaremos instruções para redefinir sua senha"
      formComponent={<ForgotPasswordForm />}
      footerText="Lembrou sua senha?"
      footerLinkText="Voltar ao login"
      footerLinkHref="/login"
      showSocialLogin={false}
    />
  );
}