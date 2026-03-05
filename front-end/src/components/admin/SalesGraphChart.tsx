type SalesGraphItem = {
  productId: string;
  name: string;
  units: number;
  value: number;
};

type SalesGraphChartProps = {
  isSalesLoading: boolean;
  graphSalesByProduct: SalesGraphItem[];
  maxSalesValue: number;
};

function SalesGraphChart({
  isSalesLoading,
  graphSalesByProduct,
  maxSalesValue,
}: SalesGraphChartProps) {
  return (
    <>
      {isSalesLoading ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          Loading sales graph...
        </p>
      ) : graphSalesByProduct.length === 0 ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          No sales data available.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {graphSalesByProduct.map((entry) => (
            <div key={entry.productId}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{entry.name}</span>
                <span className="font-medium">
                  {entry.units} sold | {'\u20B9'}
                  {entry.value}
                </span>
              </div>
              <div className="h-3 rounded bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-3 rounded bg-sky-600 dark:bg-sky-400"
                  style={{
                    width: `${maxSalesValue === 0 ? 0 : Math.max((entry.value / maxSalesValue) * 100, 6)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default SalesGraphChart;
export type { SalesGraphItem };
