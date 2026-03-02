import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggleButton from '../components/ThemeToggleButton';
import StoreLogo from '../components/StoreLogo';

function HomePage() {
  const [isLoginChooserOpen, setIsLoginChooserOpen] = useState(false);

  const closeLoginChooser = () => {
    setIsLoginChooserOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center">
            <StoreLogo
              className="h-12"
              imgClassName="h-12 w-auto"
              textClassName="text-xl font-bold"
            />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/catalogue" className="hover:underline">
              Catalogue
            </Link>
            <button
              type="button"
              onClick={() => setIsLoginChooserOpen(true)}
              className="hover:underline"
            >
              Login
            </button>
            <ThemeToggleButton />
          </nav>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <section className="text-center">
          <StoreLogo
            className="justify-center"
            imgClassName="mx-auto h-24 w-auto"
            textClassName="text-5xl font-extrabold tracking-tight"
          />
          <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">
            20 years of trust.
          </p>
        </section>
      </main>

      {isLoginChooserOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-colors dark:bg-slate-800">
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-xl font-bold">Choose Login</h3>
              <button
                type="button"
                onClick={closeLoginChooser}
                className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                aria-label="Close login selector"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                to="/customer/login"
                onClick={closeLoginChooser}
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
                onClick={closeLoginChooser}
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
      ) : null}
    </div>
  );
}

export default HomePage;
