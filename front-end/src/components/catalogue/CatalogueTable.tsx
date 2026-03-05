type GroceryPrice = {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
};

type CatalogueTableProps = {
  visibleItems: GroceryPrice[];
  isGroceryLoading: boolean;
  groceryError: string | null;
};

function CatalogueTable({
  visibleItems,
  isGroceryLoading,
  groceryError,
}: CatalogueTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-300 lg:col-span-8 dark:border-slate-700">
      <table className="min-w-full bg-white text-left dark:bg-slate-800">
        <thead className="bg-slate-200 text-sm uppercase tracking-wide dark:bg-slate-700">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Price</th>
          </tr>
        </thead>
        <tbody>
          {isGroceryLoading ? (
            <tr className="border-t border-slate-300 dark:border-slate-700">
              <td
                colSpan={3}
                className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
              >
                Loading catalogue items...
              </td>
            </tr>
          ) : groceryError ? (
            <tr className="border-t border-slate-300 dark:border-slate-700">
              <td
                colSpan={3}
                className="px-4 py-3 text-sm text-rose-600 dark:text-rose-400"
              >
                {groceryError}
              </td>
            </tr>
          ) : visibleItems.length === 0 ? (
            <tr className="border-t border-slate-300 dark:border-slate-700">
              <td
                colSpan={3}
                className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
              >
                No items found for selected filter.
              </td>
            </tr>
          ) : (
            visibleItems.map((grocery) => (
              <tr
                key={grocery.id}
                className="border-t border-slate-300 dark:border-slate-700"
              >
                <td className="px-4 py-3">{grocery.name}</td>
                <td className="px-4 py-3">{grocery.quantity}</td>
                <td className="px-4 py-3">
                  {'\u20B9'}
                  {grocery.price}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CatalogueTable;
