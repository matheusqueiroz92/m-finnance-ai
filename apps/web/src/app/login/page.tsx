import PageAuth from '@/components/auth/PageAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <PageAuth
      title="Bem-vindo de volta!"
      subtitle="Entre para continuar gerenciando suas finanças"
      formComponent={<LoginForm />}
      footerText="Não tem uma conta?"
      footerLinkText="Cadastre-se"
      footerLinkHref="/register"
      showSocialLogin={true}
    />
  );
}