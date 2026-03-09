import { useNavigate } from 'react-router-dom';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { useAdminProductEditor } from '@/pages/admin-dashboard/useAdminProductEditor';
import { useAdminSalesData } from '@/pages/admin-dashboard/useAdminSalesData';

type DashboardIcon = 'chart' | 'alert' | 'box' | 'users';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { stockAlertItems, products } = useAdminProductEditor();
  const { graphSalesByProduct, soldAmount } = useAdminSalesData();

  const salesPreview = graphSalesByProduct
    .slice(0, 2)
    .map((item) => `${item.name}: \u20B9${item.value}`);
  const stockPreview = stockAlertItems
    .slice(0, 2)
    .map((item) => `${item.name}: Currently Stock - ${item.stock}`);
  const inventoryPreview = products
    .slice(0, 2)
    .map((item) => `${item.name}: Stock - ${item.stock}`);

  const outOfStockCount = products.filter((item) => item.stock <= 0).length;
  const activeProductsCount = products.length;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `\u20B9${soldAmount.toLocaleString('en-IN')}`,
      tone: 'from-sky-500/20 to-cyan-500/10',
    },
    {
      title: 'Low Stock Items',
      value: `${stockAlertItems.length}`,
      tone: 'from-amber-500/20 to-orange-500/10',
    },
    {
      title: 'Out Of Stock',
      value: `${outOfStockCount}`,
      tone: 'from-rose-500/20 to-red-500/10',
    },
    {
      title: 'Active Products',
      value: `${activeProductsCount}`,
      tone: 'from-emerald-500/20 to-green-500/10',
    },
  ];

  const dashboardItems: Array<{
    title: string;
    previewLines: string[];
    path: string;
    icon: DashboardIcon;
  }> = [
    {
      title: 'Sales Graph',
      previewLines:
        salesPreview.length > 0
          ? salesPreview
          : ['No sales data available.', 'Click to view details.'],
      path: '/admin/sales-graph',
      icon: 'chart',
    },
    {
      title: 'Stock Alerts',
      previewLines:
        stockPreview.length > 0
          ? stockPreview
          : ['No stock alerts currently.', 'Click to view details.'],
      path: '/admin/stock-alerts',
      icon: 'alert',
    },
    {
      title: 'Inventory',
      previewLines:
        inventoryPreview.length > 0
          ? inventoryPreview
          : ['No inventory data available.', 'Click to view details.'],
      path: '/admin/product-management',
      icon: 'box',
    },
    {
      title: 'Customer Details',
      previewLines: ['No content yet.', 'Click to open page.'],
      path: '/admin/customer-details',
      icon: 'users',
    },
  ];

  const iconClassName = 'h-5 w-5 text-slate-700 dark:text-slate-300';

  const renderIcon = (icon: DashboardIcon) => {
    if (icon === 'chart') {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={iconClassName}
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 19V5m8 14V9m8 10V3M2 19h20"
          />
        </svg>
      );
    }
    if (icon === 'alert') {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={iconClassName}
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.3 3.84 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.7 3.84a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      );
    }
    if (icon === 'box') {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={iconClassName}
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m12 2 8 4.5v11L12 22l-8-4.5v-11L12 2Zm0 0v20m8-15.5-8 4.5-8-4.5"
          />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={iconClassName}
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        />
      </svg>
    );
  };

  return (
    <AdminPageLayout title="Admin Dashboard" subtitle="Overview and quick actions.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <article
            key={kpi.title}
            className={`rounded-xl border border-slate-300 bg-gradient-to-br ${kpi.tone} p-4 dark:border-slate-700`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {kpi.title}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {kpi.value}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid min-h-[calc(100vh-380px)] grid-cols-1 gap-6 py-2 md:grid-cols-2 md:py-6">
        {dashboardItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className="group rounded-xl border border-slate-300 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-400"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
                {renderIcon(item.icon)}
              </div>
              <span className="text-xs font-semibold text-sky-700 transition group-hover:translate-x-0.5 dark:text-sky-400">
                View details -&gt;
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold">{item.title}</p>
            <div className="mt-2 space-y-1">
              {item.previewLines.slice(0, 2).map((line) => (
                <p
                  key={`${item.path}-${line}`}
                  className="line-clamp-1 text-sm text-slate-700 dark:text-slate-300"
                >
                  {line}
                </p>
              ))}
            </div>
          </button>
        ))}
      </section>
    </AdminPageLayout>
  );
}

export default AdminDashboardPage;
