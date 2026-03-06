type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderThreshold: number;
};

type AdminInventorySectionProps = {
  isProductsLoading: boolean;
  products: InventoryItem[];
};

function AdminInventorySection({
  isProductsLoading,
  products
}: AdminInventorySectionProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-lg font-semibold">Inventory</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-300 dark:border-slate-700">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Item</th>
              <th className="px-2 py-2">Category</th>
              <th className="px-2 py-2">Stock</th>
              <th className="px-2 py-2">Reorder</th>
            </tr>
          </thead>
          <tbody>
            {isProductsLoading ? (
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td colSpan={5} className="px-2 py-2 text-slate-700 dark:text-slate-300">
                  Loading stock data...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td colSpan={5} className="px-2 py-2 text-slate-700 dark:text-slate-300">
                  No inventory data available.
                </td>
              </tr>
            ) : (
              products.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{item.name}</td>
                  <td className="px-2 py-2">{item.category}</td>
                  <td className="px-2 py-2">{item.stock}</td>
                  <td className="px-2 py-2">{item.reorderThreshold}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default AdminInventorySection;
