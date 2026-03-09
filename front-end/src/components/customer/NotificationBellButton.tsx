import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { graphqlRequest } from '@/api/graphqlClient';
import { GET_UNREAD_NOTIFICATIONS_COUNT } from '@/api/operations';

type NotificationBellButtonProps = {
  customerId?: string;
};

type UnreadNotificationsCountResponse = {
  notifications_aggregate: {
    aggregate: {
      count: number;
    } | null;
  };
};

function NotificationBellButton({ customerId }: NotificationBellButtonProps) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    if (!customerId) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await graphqlRequest<UnreadNotificationsCountResponse>(
        GET_UNREAD_NOTIFICATIONS_COUNT,
        { customerId }
      );
      setUnreadCount(data.notifications_aggregate.aggregate?.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, [customerId]);

  useEffect(() => {
    void loadUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 10000);

    const onFocus = () => {
      void loadUnreadCount();
    };
    const onNotificationsUpdated = () => {
      void loadUnreadCount();
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('notifications-updated', onNotificationsUpdated);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('notifications-updated', onNotificationsUpdated);
    };
  }, [loadUnreadCount]);

  return (
    <button
      type="button"
      onClick={() => navigate('/customer/notifications')}
      className="relative rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
      aria-label="Open notifications"
      title="Notifications"
    >
      <span className="text-sm" aria-hidden="true">
        🔔
      </span>
      {unreadCount > 0 ? (
        <span className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </button>
  );
}

export default NotificationBellButton;
