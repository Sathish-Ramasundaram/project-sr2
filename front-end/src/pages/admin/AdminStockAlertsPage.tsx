import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminStockAlertsSection from '@/components/admin/AdminStockAlertsSection';
import { useAdminProductEditor } from '@/pages/admin-dashboard/useAdminProductEditor';

function AdminStockAlertsPage() {
  const { productsError, isProductsLoading, stockAlertItems } =
    useAdminProductEditor();

  return (
    <AdminPageLayout
      title="Stock Alerts"
      subtitle="Products that need replenishment."
    >
      {productsError ? (
        <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">
          {productsError}
        </p>
      ) : null}
      <AdminStockAlertsSection
        isProductsLoading={isProductsLoading}
        stockAlertItems={stockAlertItems}
      />
    </AdminPageLayout>
  );
}

export default AdminStockAlertsPage;
