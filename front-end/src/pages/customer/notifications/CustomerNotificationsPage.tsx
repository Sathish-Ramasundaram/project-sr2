import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import NotificationBellButton from '@/components/customer/NotificationBellButton';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import StoreLogo from '@/components/shared/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { graphqlRequest } from '@/api/graphqlClient';
import {
  GET_CUSTOMER_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
} from '@/api/operations';
import { logout } from '@/store/auth/authSlice';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatBackendError } from '@/utils/apiError';

type NotificationItem = {
  id: string;
  customer_id: string;
  order_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type CustomerNotificationsResponse = {
  notifications: NotificationItem[];
};

function CustomerNotificationsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);
  const customerName = user?.name?.trim() || 'Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setNotificationError(null);
      const data = await graphqlRequest<CustomerNotificationsResponse>(
        GET_CUSTOMER_NOTIFICATIONS,
        { customerId: user.id }
      );
      setNotifications(data.notifications ?? []);
    } catch (error) {
      setNotifications([]);
      setNotificationError(formatBackendError(error, 'notifications'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadNotifications();
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 10000);
    const onFocus = () => {
      void loadNotifications();
    };
    const onNotificationsUpdated = () => {
      void loadNotifications();
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('notifications-updated', onNotificationsUpdated);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('notifications-updated', onNotificationsUpdated);
    };
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      setNotificationError(null);
      await graphqlRequest(MARK_NOTIFICATION_AS_READ, {
        notificationId,
        customerId: user.id,
      });
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      setNotificationError(formatBackendError(error, 'mark notification read'));
    }
  };

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

      <PageMain>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <Link
            to="/customer/home"
            className="text-sm text-sky-700 hover:underline dark:text-sky-400"
          >
            Continue Shopping
          </Link>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading notifications...
          </p>
        ) : notificationError ? (
          <p className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            {notificationError}
          </p>
        ) : notifications.length === 0 ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            No notifications yet.
          </p>
        ) : (
          <section className="space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-lg border p-4 ${
                  notification.is_read
                    ? 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
                    : 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    <Link
                      to={`/customer/orders/${notification.order_id}/track`}
                      className="mt-2 inline-block text-sm text-sky-700 hover:underline dark:text-sky-400"
                    >
                      Track this order
                    </Link>
                  </div>
                  {!notification.is_read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    >
                      Mark as read
                    </button>
                  ) : (
                    <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Read
                    </span>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </PageMain>
    </PageShell>
  );
}

export default CustomerNotificationsPage;
