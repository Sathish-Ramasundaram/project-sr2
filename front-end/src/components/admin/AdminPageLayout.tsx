import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import StoreLogo from '@/components/shared/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { clearAdminSession } from '@/store/admin/adminStorage';

type AdminPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showDashboardButton?: boolean;
};

function AdminPageLayout({
  title,
  subtitle,
  children,
  showDashboardButton = true,
}: AdminPageLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login');
  };

  return (
    <PageShell>
      <AppHeader
        left={
          <StoreLogo
            className="mt-2 h-12"
            imgClassName="h-12 w-auto"
          />
        }
        right={
          <div className="flex items-center gap-2">
            {showDashboardButton ? (
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="rounded-md bg-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Dashboard
              </button>
            ) : null}
            <ThemeToggleButton />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Logout
            </button>
          </div>
        }
      />

      <PageMain>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-6">{children}</div>
      </PageMain>
    </PageShell>
  );
}

export default AdminPageLayout;
