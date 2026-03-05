import React from 'react';
import { Link } from 'react-router-dom';

type LoginChooserProps = {
  isOpen: boolean;
  onClose: () => void;
};

function LoginChooser({ isOpen, onClose }: LoginChooserProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-colors dark:bg-slate-800">
        <div className="mb-6 flex items-start justify-between">
          <h3 className="text-xl font-bold">Choose Login</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label="Close login selector"
          >
            X
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/customer/login?switch=1"
            onClick={onClose}
            className="flex flex-col items-center gap-3 rounded-xl border border-slate-300 px-4 py-5 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-400 dark:hover:bg-slate-700"
          >
            <span className="rounded-full bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <span className="font-semibold">Customer Login</span>
          </Link>

          <Link
            to="/admin/login"
            onClick={onClose}
            className="flex flex-col items-center gap-3 rounded-xl border border-slate-300 px-4 py-5 text-center transition hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-600 dark:hover:border-emerald-400 dark:hover:bg-slate-700"
          >
            <span className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M12 2l8 4v6c0 5-3.5 8.8-8 10-4.5-1.2-8-5-8-10V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>
            <span className="font-semibold">Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginChooser;
