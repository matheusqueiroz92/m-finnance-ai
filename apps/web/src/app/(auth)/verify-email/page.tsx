import PageAuth from '@/components/auth/PageAuth';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';

export default function VerifyEmailPage() {
  return (
    <PageAuth
      title="Verifique seu email"
      subtitle="Enviamos um código de verificação para seu email"
      formComponent={<VerifyEmailForm />}
      footerText="Não recebeu o email?"
      footerLinkText="Reenviar código"
      footerLinkHref="/resend-verification"
      showSocialLogin={false}
    />
  );
}