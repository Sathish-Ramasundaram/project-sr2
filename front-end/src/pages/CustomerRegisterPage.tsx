import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { clearAuthFeedback, registerRequest } from "../store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

function CustomerRegisterPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, status, error, info } = useAppSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    dispatch(clearAuthFeedback());
  }, [dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/customer/home" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      registerRequest({
        name,
        email,
        password,
        confirmPassword,
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
          <ThemeToggleButton />
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="mx-auto max-w-md rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            {info && <p className="text-sm text-emerald-700 dark:text-emerald-400">{info}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {status === "loading" ? "Creating..." : "Submit"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/" className="text-sky-700 hover:underline dark:text-sky-400">
              Back to Home
            </Link>
            <Link to="/customer/login" className="text-sky-700 hover:underline dark:text-sky-400">
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CustomerRegisterPage;
