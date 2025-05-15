import PageAuth from '@/components/auth/PageAuth';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <PageAuth
      title="Criar nova senha"
      subtitle="Digite sua nova senha abaixo"
      formComponent={<ResetPasswordForm />}
      footerText="Lembrou sua senha?"
      footerLinkText="Voltar ao login"
      footerLinkHref="/login"
      showSocialLogin={false}
    />
  );
}