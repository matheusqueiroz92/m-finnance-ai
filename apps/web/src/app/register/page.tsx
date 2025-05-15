import PageAuth from '@/components/auth/PageAuth';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <PageAuth
      title="Crie sua conta"
      subtitle="Cadastre-se para começar a gerenciar suas finanças"
      formComponent={<RegisterForm />}
      footerText="Já tem uma conta?"
      footerLinkText="Entre aqui"
      footerLinkHref="/login"
      showSocialLogin={true}
    />
  );
}