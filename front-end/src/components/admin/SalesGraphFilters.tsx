type SalesFilter = 'last30' | 'custom';
type SalesRankMode = 'top' | 'least';

type SalesGraphFiltersProps = {
  salesRankMode: SalesRankMode;
  salesFilter: SalesFilter;
  graphProductCount: number;
  fromDate: string;
  toDate: string;
  onSalesRankModeChange: (value: SalesRankMode) => void;
  onSalesFilterChange: (value: SalesFilter) => void;
  onGraphProductCountChange: (value: number) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
};

function SalesGraphFilters({
  salesRankMode,
  salesFilter,
  graphProductCount,
  fromDate,
  toDate,
  onSalesRankModeChange,
  onSalesFilterChange,
  onGraphProductCountChange,
  onFromDateChange,
  onToDateChange,
}: SalesGraphFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={salesFilter}
        onChange={(event) =>
          onSalesFilterChange(event.target.value as SalesFilter)
        }
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
      >
        <option value="last30">Last 30 days</option>
        <option value="custom">Select date</option>
      </select>
      <select
        value={salesRankMode}
        onChange={(event) =>
          onSalesRankModeChange(event.target.value as SalesRankMode)
        }
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
      >
        <option value="top">Top Sales</option>
        <option value="least">Least Sales</option>
      </select>
      <select
        value={graphProductCount}
        onChange={(event) =>
          onGraphProductCountChange(Number(event.target.value))
        }
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
      >
        {[5, 10, 15, 20].map((count) => (
          <option key={count} value={count}>
            {count}
          </option>
        ))}
      </select>
      {salesFilter === 'custom' ? (
        <>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => onFromDateChange(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
          <input
            type="date"
            value={toDate}
            onChange={(event) => onToDateChange(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
        </>
      ) : null}
    </div>
  );
}

export default SalesGraphFilters;
export type { SalesFilter, SalesRankMode };
