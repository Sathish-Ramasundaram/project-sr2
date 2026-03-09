import { hasuraAdminRequest } from '../../lib/hasuraClient';
import jwt from 'jsonwebtoken';

type OrderByIdResponse = {
  orders_by_pk: {
    id: string;
    customer_id: string;
    placed_at: string;
    status: string;
    total_amount: number;
    order_items: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      product: {
        id: string;
        name: string;
        unit: string | null;
      } | null;
    }>;
  } | null;
};

export type TrackOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unit: string;
};

export type TrackOrderOrder = {
  orderId: string;
  placedAt: string;
  orderStatus: string;
  totalAmount: number;
  items: TrackOrderItem[];
};

export type TrackOrderResult = {
  status: 'shipped' | 'ongoing' | 'delivered';
  estimatedTime: string;
  order: TrackOrderOrder;
};

const GET_ORDER_BY_ID = `
query GetOrderById($orderId: uuid!) {
  orders_by_pk(id: $orderId) {
    id
    customer_id
    placed_at
    status
    total_amount
    order_items(order_by: [{ id: asc }]) {
      id
      quantity
      unit_price
      product {
        id
        name
        unit
      }
    }
  }
}
`;

function resolveDeliveryStatus(placedAtIso: string): TrackOrderResult['status'] {
  const placedAt = new Date(placedAtIso).getTime();
  const hoursSincePlaced = (Date.now() - placedAt) / (1000 * 60 * 60);

  if (hoursSincePlaced >= 4) {
    return 'delivered';
  }
  if (hoursSincePlaced >= 1) {
    return 'ongoing';
  }
  return 'shipped';
}

function resolveEstimatedTime(status: TrackOrderResult['status']): string {
  if (status === 'delivered') {
    return 'Delivered';
  }
  if (status === 'ongoing') {
    return 'Arriving in 30-90 minutes';
  }
  return 'Arriving in 2-4 hours';
}

export async function getTrackedOrder(orderId: string): Promise<TrackOrderResult> {
  return getTrackedOrderForCustomer(orderId, null);
}

function getCustomerIdFromAuthorizationHeader(authorizationHeader: string): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  if (!authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = authorizationHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, secret) as {
    sub?: string;
    'https://hasura.io/jwt/claims'?: {
      'x-hasura-user-id'?: string;
    };
  };

  const claimUserId = decoded?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id'];
  if (typeof claimUserId === 'string' && claimUserId.trim()) {
    return claimUserId.trim();
  }

  if (typeof decoded?.sub === 'string' && decoded.sub.trim()) {
    return decoded.sub.trim();
  }

  return null;
}

export async function getTrackedOrderForCustomer(
  orderId: string,
  authorizationHeader: string | null
): Promise<TrackOrderResult> {
  if (!authorizationHeader) {
    throw new Error('Unauthorized: missing authorization header.');
  }
  const requesterCustomerId = getCustomerIdFromAuthorizationHeader(authorizationHeader);
  if (!requesterCustomerId) {
    throw new Error('Unauthorized: invalid token.');
  }

  const data = await hasuraAdminRequest<OrderByIdResponse>(GET_ORDER_BY_ID, { orderId });

  if (!data.orders_by_pk) {
    throw new Error('Order not found.');
  }

  const order = data.orders_by_pk;
  if (order.customer_id !== requesterCustomerId) {
    throw new Error('Forbidden: this order does not belong to the signed-in customer.');
  }
  const items: TrackOrderItem[] = order.order_items.map((item) => ({
    productId: item.product?.id ?? '',
    productName: item.product?.name ?? 'Unknown item',
    quantity: Number(item.quantity ?? 0),
    unitPrice: Number(item.unit_price ?? 0),
    lineTotal: Number(item.quantity ?? 0) * Number(item.unit_price ?? 0),
    unit: item.product?.unit ?? '',
  }));

  const status = resolveDeliveryStatus(order.placed_at);
  const estimatedTime = resolveEstimatedTime(status);

  return {
    status,
    estimatedTime,
    order: {
      orderId: order.id,
      placedAt: order.placed_at,
      orderStatus: order.status,
      totalAmount: Number(order.total_amount ?? 0),
      items,
    },
  };
}
