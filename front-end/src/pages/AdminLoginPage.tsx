import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { adminLoginRequest, clearAdminFeedback } from "../store/admin/adminSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, status, error, info } = useAppSelector((state) => state.admin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(clearAdminFeedback());
  }, [dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(adminLoginRequest({ email, password }));
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
          <h2 className="text-2xl font-bold">Admin Login</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
              {status === "loading" ? "Signing in..." : "Submit"}
            </button>
          </form>

          <Link to="/" className="mt-4 inline-block text-sm text-sky-700 hover:underline dark:text-sky-400">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminLoginPage;
