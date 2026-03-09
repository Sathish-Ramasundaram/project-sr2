import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import PageMain from '@/components/PageMain';
import PageShell from '@/components/PageShell';
import StoreLogo from '@/components/StoreLogo';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { graphqlRequest } from '@/api/graphqlClient';
import { TRACK_ORDER } from '@/api/operations';
import { logout } from '@/store/auth/authSlice';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatBackendError } from '@/utils/apiError';

type TrackOrderResponse = {
  trackOrder: {
    status: string;
    estimatedTime: string;
    order: {
      orderId: string;
      placedAt: string;
      orderStatus: string;
      totalAmount: number;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        unit: string;
      }>;
    };
  };
};

function CustomerOrderTrackPage() {
  const { orderId = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);
  const customerName = user?.name?.trim() || 'Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();
  const [isLoading, setIsLoading] = useState(true);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackOrderResponse['trackOrder'] | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const loadTracking = async () => {
      if (!orderId) {
        setTrackError('Order ID is required.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setTrackError(null);
        const data = await graphqlRequest<TrackOrderResponse>(TRACK_ORDER, {
          orderId,
        });
        setTrackData(data.trackOrder);
      } catch (error) {
        setTrackData(null);
        setTrackError(formatBackendError(error, 'order tracking'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadTracking();
    const intervalId = window.setInterval(() => {
      void loadTracking();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [orderId]);

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
              onClick={() => navigate('/customer/orders')}
              className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Orders
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
          <h2 className="text-2xl font-bold">Track Order</h2>
          <Link
            to="/customer/orders"
            className="text-sm text-sky-700 hover:underline dark:text-sky-400"
          >
            Back to Order History
          </Link>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading tracking details...
          </p>
        ) : trackError ? (
          <p className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            {trackError}
          </p>
        ) : trackData ? (
          <section className="grid gap-6 lg:grid-cols-12">
            <article className="rounded-lg border border-slate-300 bg-white p-4 lg:col-span-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Order ID: {trackData.order.orderId}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Placed: {new Date(trackData.order.placedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold capitalize">
                    Delivery Status: {trackData.status}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    ETA: {trackData.estimatedTime}
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {'\u20B9'}
                    {trackData.order.totalAmount}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-slate-300 bg-white p-4 lg:col-span-7 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="text-lg font-semibold">Items</h3>
              <ul className="mt-3 space-y-2">
                {trackData.order.items.map((item, index) => (
                  <li
                    key={`${item.productId}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        Qty: {item.quantity} {item.unit}
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
          </section>
        ) : null}
      </PageMain>
    </PageShell>
  );
}

export default CustomerOrderTrackPage;
