import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppHeader from "@/components/layout/AppHeader";
import PageMain from "@/components/layout/PageMain";
import PageShell from "@/components/layout/PageShell";
import StoreLogo from "@/components/shared/StoreLogo";
import ThemeToggleButton from "@/components/theme/ThemeToggleButton";
import { getAdminSession, getAdminToken, setAdminSession, setAdminToken } from "@/store/admin/adminStorage";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (getAdminSession() && getAdminToken()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const response = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: { message?: string; token?: string } = await response.json();

      if (response.ok) {
        if (!data.token) {
          setMessage("Login failed: missing token.");
        } else {
          setAdminToken(data.token);
          setAdminSession();
          navigate("/admin/dashboard");
          return;
        }
      }

      setMessage(data.message ?? "Login failed");
    } catch (error) {
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <AppHeader
        left={(
          <StoreLogo
            className="mt-2 h-12"
            imgClassName="h-12 w-auto"
          />
        )}
        right={<ThemeToggleButton />}
      />

      <PageMain className="py-10">
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
                required
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
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            {message && <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <Link to="/" className="mt-4 inline-block text-sm text-sky-700 hover:underline dark:text-sky-400">
            Back to Home
          </Link>
        </div>
      </PageMain>
    </PageShell>
  );
}

export default AdminLoginPage;




