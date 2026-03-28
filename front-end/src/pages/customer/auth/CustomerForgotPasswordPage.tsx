import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import StoreLogo from '@/components/public/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import {
  clearAuthFeedback,
  forgotPasswordRequest,
} from '@/store/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function CustomerForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { status, error, info } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    dispatch(clearAuthFeedback());
  }, [dispatch]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      forgotPasswordRequest({
        email,
        newPassword,
        confirmNewPassword,
      })
    );
  };

  return (
    <PageShell>
      <AppHeader
        left={<StoreLogo className="mt-2 h-12" imgClassName="h-12 w-auto" />}
        right={<ThemeToggleButton />}
      />

      <PageMain className="py-10">
        <div className="mx-auto max-w-md rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-sm font-medium"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
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
              {status === 'loading' ? 'Submitting...' : 'Submit'}
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
              to="/customer/login"
              className="text-sky-700 hover:underline dark:text-sky-400"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </PageMain>
    </PageShell>
  );
}

export default CustomerForgotPasswordPage;
