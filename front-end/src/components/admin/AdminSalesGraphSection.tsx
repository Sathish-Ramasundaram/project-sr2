import SalesGraphFilters, {
  type SalesFilter,
  type SalesRankMode,
} from './SalesGraphFilters';
import SalesGraphChart, { type SalesGraphItem } from './SalesGraphChart';

type AdminSalesGraphSectionProps = {
  salesRankMode: SalesRankMode;
  salesFilter: SalesFilter;
  graphProductCount: number;
  fromDate: string;
  toDate: string;
  soldAmount: number;
  isSalesLoading: boolean;
  graphSalesByProduct: SalesGraphItem[];
  maxSalesValue: number;
  onSalesRankModeChange: (value: SalesRankMode) => void;
  onSalesFilterChange: (value: SalesFilter) => void;
  onGraphProductCountChange: (value: number) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
};

function AdminSalesGraphSection({
  salesRankMode,
  salesFilter,
  graphProductCount,
  fromDate,
  toDate,
  soldAmount,
  isSalesLoading,
  graphSalesByProduct,
  maxSalesValue,
  onSalesRankModeChange,
  onSalesFilterChange,
  onGraphProductCountChange,
  onFromDateChange,
  onToDateChange,
}: AdminSalesGraphSectionProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Sales Graph ({salesRankMode === 'top' ? 'Top Sales' : 'Least Sales'})
        </h2>
        <SalesGraphFilters
          salesRankMode={salesRankMode}
          salesFilter={salesFilter}
          graphProductCount={graphProductCount}
          fromDate={fromDate}
          toDate={toDate}
          onSalesRankModeChange={onSalesRankModeChange}
          onSalesFilterChange={onSalesFilterChange}
          onGraphProductCountChange={onGraphProductCountChange}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
        />
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Total sales: {'\u20B9'}
        {soldAmount}
      </p>
      <SalesGraphChart
        isSalesLoading={isSalesLoading}
        graphSalesByProduct={graphSalesByProduct}
        maxSalesValue={maxSalesValue}
      />
    </article>
  );
}

export default AdminSalesGraphSection;
