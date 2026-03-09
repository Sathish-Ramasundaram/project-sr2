import { hasuraAdminRequest } from '../../lib/hasuraClient';

type CustomerOrdersResponse = {
  orders: Array<{
    id: string;
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
  }>;
};

const GET_CUSTOMER_ORDERS = `
query GetCustomerOrders($customerId: uuid!) {
  orders(
    where: { customer_id: { _eq: $customerId } }
    order_by: [{ placed_at: desc }]
  ) {
    id
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

export async function getCustomerOrders(customerId: string) {
  const data = await hasuraAdminRequest<CustomerOrdersResponse>(
    GET_CUSTOMER_ORDERS,
    {
      customerId,
    }
  );

  return data.orders.map((order) => ({
    id: order.id,
    placedAt: order.placed_at,
    status: order.status,
    totalAmount: Number(order.total_amount ?? 0),
    items: order.order_items.map((item) => ({
      id: item.id,
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unit_price ?? 0),
      lineTotal: Number(item.quantity ?? 0) * Number(item.unit_price ?? 0),
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            unit: item.product.unit ?? '',
          }
        : null,
    })),
  }));
}
