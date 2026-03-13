import React from 'react';
import { Link } from 'react-router-dom';

type RegisterFormProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: string;
  error: string | null;
  info: string | null;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function RegisterForm({
  name,
  email,
  password,
  confirmPassword,
  status,
  error,
  info,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-2xl font-bold">Create Account</h2>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div>
          <label htmlFor="register-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium"
          >
            Confirm Password
          </label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
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
          {status === 'loading' ? 'Creating...' : 'Submit'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/" className="text-sky-700 hover:underline dark:text-sky-400">
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
  );
}

export default RegisterForm;
