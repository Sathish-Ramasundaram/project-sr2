import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import NotificationBellButton from '@/components/customer/NotificationBellButton';
import PageMain from '@/components/layout/PageMain';
import ProductGrid from '@/components/customer-home/ProductGrid';
import StoreLogo from '@/components/public/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { formatBackendError } from '@/utils/apiError';
import { CATALOGUE_SYNC_KEY } from '@/utils/catalogueSync';
import { logout } from '@/store/auth/authSlice';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useCartActions } from '@/pages/customer-home/useCartActions';
import type { Product } from '@/types/product';

type CatalogueProductsResponseItem = {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
};

function CustomerHomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockByProductId, setStockByProductId] = useState<
    Record<string, number>
  >({});
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [reloadSignal, setReloadSignal] = useState(0);

  const {
    cartByProductId,
    cartLoadingProductId,
    inlineCartFeedback,
    handleAddToCart,
    handleDecreaseCart,
    handleRemoveFromCart,
  } = useCartActions(user?.id);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === CATALOGUE_SYNC_KEY) {
        setReloadSignal((current) => current + 1);
      }
    };

    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsError(null);
        setIsProductsLoading(true);
        const response = await fetch(
          'http://localhost:5000/api/catalogue/products'
        );
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = (await response.json()) as CatalogueProductsResponseItem[];

        const mappedProducts: Product[] = data.map((product) => ({
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          quantity: product.quantity,
          price: Number(product.price),
          description: product.description ?? '',
        }));
        const stockMap: Record<string, number> = {};
        data.forEach((product) => {
          stockMap[product.id] = Number(product.stock ?? 0);
        });

        setProducts(mappedProducts);
        setStockByProductId(stockMap);
      } catch (error) {
        setProducts([]);
        setStockByProductId({});
        setProductsError(formatBackendError(error, 'products'));
      } finally {
        setIsProductsLoading(false);
      }
    };

    void loadProducts();
  }, [reloadSignal]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const customerName = user?.name?.trim() || 'Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 17
        ? 'Good Afternoon'
        : 'Good Evening';

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <div className="sticky top-0 z-40 shrink-0">
        <AppHeader
          left={
            <div>
              <StoreLogo className="mt-2 h-12" imgClassName="h-12 w-auto" />
            </div>
          }
          right={
            <div className="flex items-center gap-3">
              <div
                title={customerName}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-700 text-xs font-semibold text-white dark:bg-sky-500 dark:text-slate-900"
              >
                {customerInitial}
              </div>
              <button
                type="button"
                onClick={() => navigate('/customer/cart')}
                className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Cart: {cartCount}
              </button>
              <button
                type="button"
                onClick={() => navigate('/customer/orders')}
                className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Orders
              </button>
              <NotificationBellButton customerId={user?.id} />
              <ThemeToggleButton />
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                Logout
              </button>
            </div>
          }
        />
      </div>

      <PageMain className="h-[calc(100vh-56px)] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {greeting}, {customerName}
          </p>
        </div>
        {isProductsLoading ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading products...
          </p>
        ) : productsError ? (
          <p className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            {productsError}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            No products available right now.
          </p>
        ) : (
          <ProductGrid
            products={products}
            stockByProductId={stockByProductId}
            cartByProductId={cartByProductId}
            cartLoadingProductId={cartLoadingProductId}
            inlineCartFeedback={inlineCartFeedback}
            onAddToCart={handleAddToCart}
            onDecreaseCart={handleDecreaseCart}
            onRemoveFromCart={handleRemoveFromCart}
          />
        )}
      </PageMain>
    </div>
  );
}

export default CustomerHomePage;
