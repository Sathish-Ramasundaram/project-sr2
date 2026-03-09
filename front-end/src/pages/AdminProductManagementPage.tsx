import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminInventorySection from '@/components/admin/AdminInventorySection';
import AdminProductManagementSection from '@/components/admin/AdminProductManagementSection';
import { useAdminProductEditor } from '@/pages/admin-dashboard/useAdminProductEditor';

function AdminProductManagementPage() {
  const {
    products,
    productsError,
    isProductsLoading,
    newProductForm,
    selectedProductId,
    selectedCategory,
    displayOrderInput,
    unitInput,
    priceInput,
    reorderThresholdInput,
    stockInput,
    isActionLoading,
    actionTarget,
    actionError,
    actionInfo,
    pendingReactivateName,
    handleNewProductSubmit,
    handleNewProductFormChange,
    handleSelectedProductChange,
    handleConfirmReactivate,
    handleCancelReactivate,
    handleDeactivateProduct,
    markDirtyAndSetSelectedCategory,
    markDirtyAndSetDisplayOrder,
    markDirtyAndSetUnit,
    markDirtyAndSetPrice,
    markDirtyAndSetReorderThreshold,
    markDirtyAndSetStock,
    handleUpdateItemDetails,
  } = useAdminProductEditor();

  return (
    <AdminPageLayout
      title="Inventory"
      subtitle="Left: Add or update item details. Right: Inventory table."
    >
      {productsError ? (
        <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">
          {productsError}
        </p>
      ) : null}
      <section className="grid gap-6 lg:grid-cols-2">
        <AdminProductManagementSection
          newProductForm={newProductForm}
          products={products}
          selectedProductId={selectedProductId}
          selectedCategory={selectedCategory}
          displayOrderInput={displayOrderInput}
          unitInput={unitInput}
          priceInput={priceInput}
          reorderThresholdInput={reorderThresholdInput}
          stockInput={stockInput}
          isActionLoading={isActionLoading}
          actionTarget={actionTarget}
          actionError={actionError}
          actionInfo={actionInfo}
          pendingReactivateName={pendingReactivateName}
          onNewProductSubmit={handleNewProductSubmit}
          onNewProductFormChange={handleNewProductFormChange}
          onSelectedProductChange={handleSelectedProductChange}
          onSelectedCategoryChange={markDirtyAndSetSelectedCategory}
          onDisplayOrderInputChange={markDirtyAndSetDisplayOrder}
          onUnitInputChange={markDirtyAndSetUnit}
          onPriceInputChange={markDirtyAndSetPrice}
          onReorderThresholdInputChange={markDirtyAndSetReorderThreshold}
          onStockInputChange={markDirtyAndSetStock}
          onUpdateItemDetails={handleUpdateItemDetails}
          onConfirmReactivate={handleConfirmReactivate}
          onCancelReactivate={handleCancelReactivate}
          onDeactivateProduct={handleDeactivateProduct}
        />
        <AdminInventorySection
          isProductsLoading={isProductsLoading}
          products={products}
        />
      </section>
    </AdminPageLayout>
  );
}

export default AdminProductManagementPage;
