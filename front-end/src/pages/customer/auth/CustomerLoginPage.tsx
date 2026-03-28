import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import StoreLogo from '@/components/public/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import {
  clearAuthFeedback,
  loginRequest,
  logout,
} from '@/store/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { isCustomerActiveInAnotherTab } from '@/store/auth/authStorage';

function CustomerLoginPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const isSwitchAccount = searchParams.get('switch') === '1';
  const { isAuthenticated, status, error, info } = useAppSelector(
    (state) => state.auth
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasProcessedSwitchFlow, setHasProcessedSwitchFlow] =
    useState(!isSwitchAccount);

  useEffect(() => {
    dispatch(clearAuthFeedback());
  }, [dispatch]);

  useEffect(() => {
    if (!isSwitchAccount || hasProcessedSwitchFlow) {
      return;
    }

    if (isAuthenticated) {
      dispatch(logout());
    }

    setHasProcessedSwitchFlow(true);
  }, [dispatch, hasProcessedSwitchFlow, isAuthenticated, isSwitchAccount]);

  if (isAuthenticated && hasProcessedSwitchFlow) {
    return <Navigate to="/customer/home" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (isCustomerActiveInAnotherTab(normalizedEmail)) {
      const shouldContinue = window.confirm(
        'This account may already be active in another tab in this browser. Do you want to continue login here?'
      );
      if (!shouldContinue) {
        return;
      }
    }

    dispatch(loginRequest({ email: normalizedEmail, password }));
  };

  return (
    <PageShell>
      <AppHeader
        left={<StoreLogo className="mt-2 h-12" imgClassName="h-12 w-auto" />}
        right={<ThemeToggleButton />}
      />

      <PageMain className="py-10">
        <div className="mx-auto max-w-md rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-2xl font-bold">Customer Login</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {status === 'loading' ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link
              to="/"
              className="text-sky-700 hover:underline dark:text-sky-400"
            >
              Back to Home
            </Link>
            <Link
              to="/customer/forgot-password"
              className="text-sky-700 hover:underline dark:text-sky-400"
            >
              Forgot Password
            </Link>
            <Link
              to="/customer/register"
              className="text-sky-700 hover:underline dark:text-sky-400"
            >
              Create Account
            </Link>
          </div>
        </div>
      </PageMain>
    </PageShell>
  );
}

export default CustomerLoginPage;
