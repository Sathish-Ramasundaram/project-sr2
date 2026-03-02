import { Link, useNavigate } from "react-router-dom";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { products } from "../data/products";
import { adminLogout } from "../store/admin/adminSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

type InventoryViewItem = {
  productId: string;
  name: string;
  stock: number;
  sold: number;
  initialStock: number;
  price: number;
};

function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const inventoryItems = useAppSelector((state) => state.inventory.items);

  const inventoryView = inventoryItems
    .map((inventory) => {
      const product = products.find((entry) => entry.id === inventory.productId);
      if (!product) {
        return null;
      }

      return {
        productId: inventory.productId,
        name: product.name,
        stock: inventory.stock,
        sold: inventory.sold,
        initialStock: inventory.initialStock,
        price: product.price,
      } satisfies InventoryViewItem;
    })
    .filter((entry): entry is InventoryViewItem => Boolean(entry));

  const soldAmount = inventoryView.reduce((sum, entry) => sum + entry.sold * entry.price, 0);

  const stockAlertItems = inventoryView.filter((entry) => {
    const threshold = entry.initialStock * 0.5;
    return entry.stock <= threshold;
  });

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-1">
          <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">Sold Amount</p>
            <p className="mt-2 text-2xl font-bold">{"\u20B9"}{soldAmount}</p>
          </article>
        </section>

        <section className="mb-6 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold">Stock Alerts</h2>
          {stockAlertItems.length === 0 ? (
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">No items at or below 50% stock.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stockAlertItems.map((item) => {
                const threshold = Math.floor(item.initialStock * 0.5);
                return (
                  <li key={item.productId} className="text-sm">
                    {item.name}: stock {item.stock} (alert at {"<="} {threshold})
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold">Current Stock</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700">
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Stock</th>
                  <th className="px-2 py-2">Sold</th>
                </tr>
              </thead>
              <tbody>
                {inventoryView.map((item) => (
                  <tr key={item.productId} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="px-2 py-2">{item.name}</td>
                    <td className="px-2 py-2">{item.stock}</td>
                    <td className="px-2 py-2">{item.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Link to="/" className="mt-4 inline-block text-sm text-sky-700 hover:underline dark:text-sky-400">
          Back to Home
        </Link>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
