import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AdminSalesGraphSection from '@/components/admin/AdminSalesGraphSection';
import { useAdminSalesData } from '@/pages/admin-dashboard/useAdminSalesData';

function AdminSalesGraphPage() {
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
    graphSalesByProduct,
    maxSalesValue,
  } = useAdminSalesData();

  return (
    <AdminPageLayout
      title="Sales Graph"
      subtitle="Track product sales trends."
    >
      {salesError ? (
        <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">
          {salesError}
        </p>
      ) : null}
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
    </AdminPageLayout>
  );
}

export default AdminSalesGraphPage;
