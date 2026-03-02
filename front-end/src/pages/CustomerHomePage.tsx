import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { products } from "../data/products";
import { logout } from "../store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { productAddedToCart } from "../store/inventory/inventorySlice";

const cartStorageKey = (email: string) => `sr_store_cart_count_${email}`;

function CustomerHomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const inventoryItems = useAppSelector((state) => state.inventory.items);
  const [cartCount, setCartCount] = useState(0);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setCartCount(0);
      return;
    }

    const rawCount = localStorage.getItem(cartStorageKey(user.email));
    const parsedCount = rawCount ? Number(rawCount) : 0;
    setCartCount(Number.isFinite(parsedCount) ? parsedCount : 0);
  }, [user?.email]);

  const handleAddToCart = (productId: string) => {
    const inventory = inventoryItems.find((item) => item.productId === productId);
    if (!inventory || inventory.stock <= 0) {
      setCartMessage("Item is out of stock in godown.");
      return;
    }

    dispatch(productAddedToCart(productId));

    if (user?.email) {
      const nextCount = cartCount + 1;
      setCartCount(nextCount);
      localStorage.setItem(cartStorageKey(user.email), String(nextCount));
    }

    setCartMessage("Item added to cart.");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const hiddenPhotoProductIds = new Set<string>([]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <StoreLogo
              className="h-12"
              imgClassName="h-12 w-auto"
              textClassName="text-xl font-bold"
            />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Welcome, {user?.name ?? "Customer"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium dark:bg-slate-700">Cart: {cartCount}</span>
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
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customer Home</h2>
          <Link to="/" className="text-sm text-sky-700 hover:underline dark:text-sky-400">
            Back to Home
          </Link>
        </div>
        {cartMessage && <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">{cartMessage}</p>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              showImage={!hiddenPhotoProductIds.has(product.id)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default CustomerHomePage;
