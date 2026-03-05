type StockAlertItem = {
  id: string;
  name: string;
  stock: number;
};

type AdminStockAlertsSectionProps = {
  isProductsLoading: boolean;
  stockAlertItems: StockAlertItem[];
};

function AdminStockAlertsSection({
  isProductsLoading,
  stockAlertItems
}: AdminStockAlertsSectionProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-lg font-semibold">Stock Alerts</h2>
      {isProductsLoading ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Loading inventory...</p>
      ) : stockAlertItems.length === 0 ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">No stock alerts currently.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {stockAlertItems.map((item) => (
            <li
              key={item.id}
              className="font-serif text-xl font-extrabold tracking-wide text-rose-700 dark:text-rose-300"
            >
              {item.name}: Currently Stock - {item.stock}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default AdminStockAlertsSection;
