import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import PageMain from '@/components/PageMain';
import PageShell from '@/components/PageShell';
import StoreLogo from '@/components/StoreLogo';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { logout } from '@/store/auth/authSlice';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatBackendError } from '@/utils/apiError';

type OrderHistoryItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    unit: string;
  } | null;
};

type OrderHistoryOrder = {
  id: string;
  placedAt: string;
  status: string;
  totalAmount: number;
  items: OrderHistoryItem[];
};

type CustomerOrdersResponse = {
  orders: OrderHistoryOrder[];
};

function CustomerOrderHistoryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);
  const [orders, setOrders] = useState<OrderHistoryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const customerName = user?.name?.trim() || 'Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setOrdersError(null);
        const response = await fetch(
          `http://localhost:5000/api/customer/orders?customerId=${encodeURIComponent(user.id)}`
        );
        const body = (await response.json()) as
          | CustomerOrdersResponse
          | { message?: string };
        if (!response.ok) {
          throw new Error(
            'message' in body && body.message
              ? body.message
              : 'Failed to load orders.'
          );
        }
        const data = body as CustomerOrdersResponse;
        setOrders(data.orders ?? []);
      } catch (error) {
        setOrders([]);
        setOrdersError(formatBackendError(error, 'order history'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, [user?.id]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <PageShell>
      <AppHeader
        left={
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
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
              onClick={() => navigate('/customer/home')}
              className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/customer/cart')}
              className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Cart: {cartCount}
            </button>
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

      <PageMain>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Order History</h2>
          </div>
          <Link
            to="/customer/home"
            className="text-sm text-sky-700 hover:underline dark:text-sky-400"
          >
            Continue Shopping
          </Link>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading orders...
          </p>
        ) : ordersError ? (
          <p className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            {ordersError}
          </p>
        ) : orders.length === 0 ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            No orders found yet.
          </p>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Order ID: {order.id}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Placed: {new Date(order.placedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{order.status}</p>
                    <p className="text-lg font-bold">
                      {'\u20B9'}
                      {order.totalAmount}
                    </p>
                    <Link
                      to={`/customer/orders/${order.id}/track`}
                      className="text-sm text-sky-700 hover:underline dark:text-sky-400"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>

                <ul className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {item.product?.name ?? 'Unknown item'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Qty: {item.quantity} {item.product?.unit ?? ''}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {'\u20B9'}
                        {item.lineTotal}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        )}
      </PageMain>
    </PageShell>
  );
}

export default CustomerOrderHistoryPage;
