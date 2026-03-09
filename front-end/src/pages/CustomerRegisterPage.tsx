import { Link, Navigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import PageMain from '@/components/PageMain';
import PageShell from '@/components/PageShell';
import StoreLogo from '@/components/StoreLogo';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import RegisterForm from '@/pages/customer/RegisterForm';
import { useRegisterForm } from '@/pages/customer/useRegisterForm';
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
        left={
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
        }
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
