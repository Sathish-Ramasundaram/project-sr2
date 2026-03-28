import { Navigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import StoreLogo from '@/components/public/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import RegisterForm from '@/components/customer/RegisterForm';
import { useRegisterForm } from '@/pages/customer/auth/useRegisterForm';
import { useAppSelector } from '@/store/hooks';

function CustomerRegisterPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    status,
    error,
    info,
    handleSubmit,
  } = useRegisterForm();

  if (isAuthenticated) {
    return <Navigate to="/customer/home" replace />;
  }

  return (
    <PageShell>
      <AppHeader
        left={<StoreLogo className="mt-2 h-12" imgClassName="h-12 w-auto" />}
        right={<ThemeToggleButton />}
      />

      <PageMain className="py-10">
        <RegisterForm
          name={name}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          status={status}
          error={error}
          info={info}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
        />
      </PageMain>
    </PageShell>
  );
}

export default CustomerRegisterPage;
