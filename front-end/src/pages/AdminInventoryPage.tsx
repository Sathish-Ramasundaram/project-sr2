import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminInventorySection from '@/components/admin/AdminInventorySection';
import { useAdminProductEditor } from '@/pages/admin-dashboard/useAdminProductEditor';

function AdminInventoryPage() {
  const { productsError, isProductsLoading, products } = useAdminProductEditor();

  return (
    <AdminPageLayout
      title="Inventory"
      subtitle="Monitor stock and reorder thresholds."
    >
      {productsError ? (
        <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">
          {productsError}
        </p>
      ) : null}
      <AdminInventorySection
        isProductsLoading={isProductsLoading}
        products={products}
      />
    </AdminPageLayout>
  );
}

export default AdminInventoryPage;
