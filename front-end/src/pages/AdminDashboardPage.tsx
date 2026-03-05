import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import AdminInventorySection from "@/components/admin/AdminInventorySection";
import AdminProductManagementSection from "@/components/admin/AdminProductManagementSection";
import AdminSalesGraphSection from "@/components/admin/AdminSalesGraphSection";
import AdminStockAlertsSection from "@/components/admin/AdminStockAlertsSection";
import StoreLogo from "@/components/StoreLogo";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { adminLogout } from "@/store/admin/adminSlice";
import { useAppDispatch } from "@/store/hooks";
import { useAdminProductEditor } from "@/pages/admin-dashboard/useAdminProductEditor";
import { useAdminSalesData } from "@/pages/admin-dashboard/useAdminSalesData";

function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    products,
    productsError,
    isProductsLoading,
    stockAlertItems,
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
    handleNewProductSubmit,
    handleNewProductFormChange,
    handleSelectedProductChange,
    markDirtyAndSetSelectedCategory,
    markDirtyAndSetDisplayOrder,
    markDirtyAndSetUnit,
    markDirtyAndSetPrice,
    markDirtyAndSetReorderThreshold,
    markDirtyAndSetStock,
    handleUpdateItemDetails
  } = useAdminProductEditor();

  const {
    salesError,
    isSalesLoading,
    soldAmount,
    salesFilter,
    setSalesFilter,
    salesRankMode,
    setSalesRankMode,
    graphProductCount,
    setGraphProductCount,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    soldMap,
    graphSalesByProduct,
    maxSalesValue
  } = useAdminSalesData();

  const currentHour = new Date().getHours();
  const adminGreeting =
    currentHour < 12 ? "Good Morning" : currentHour < 17 ? "Good Afternoon" : "Good Evening";

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={(
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
        )}
        right={(
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Logout
            </button>
          </div>
        )}
      />

      <main className="w-full px-6 py-8">
        <p className="mb-6 text-sm font-medium text-slate-700 dark:text-slate-300">
          {adminGreeting}, Admin
        </p>
        {productsError ? (
          <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{productsError}</p>
        ) : null}
        {salesError ? (
          <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{salesError}</p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <AdminSalesGraphSection
            salesRankMode={salesRankMode}
            salesFilter={salesFilter}
            graphProductCount={graphProductCount}
            fromDate={fromDate}
            toDate={toDate}
            soldAmount={soldAmount}
            isSalesLoading={isSalesLoading}
            graphSalesByProduct={graphSalesByProduct}
            maxSalesValue={maxSalesValue}
            onSalesRankModeChange={setSalesRankMode}
            onSalesFilterChange={setSalesFilter}
            onGraphProductCountChange={setGraphProductCount}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
          />
          <AdminStockAlertsSection
            isProductsLoading={isProductsLoading}
            stockAlertItems={stockAlertItems}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
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
          />
          <AdminInventorySection
            isProductsLoading={isProductsLoading}
            products={products}
            soldMap={soldMap}
          />
        </section>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
