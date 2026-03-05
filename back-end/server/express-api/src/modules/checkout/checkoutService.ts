import { hasuraAdminRequest } from "../../lib/hasuraClient";

type CartCheckoutItem = {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
    inventory: {
      stock: number;
    } | null;
  } | null;
};

type GetCartForCheckoutResponse = {
  cart_items: CartCheckoutItem[];
};

type CreateOrderResponse = {
  insert_orders_one: {
    id: string;
    total_amount: number;
    status: string;
  };
};

type InsertOrderItemsResponse = {
  insert_order_items: {
    affected_rows: number;
  };
};

type CreatePaymentResponse = {
  insert_payments_one: {
    id: string;
    status: string;
  };
};

type UpdateOrderStatusResponse = {
  update_orders: {
    affected_rows: number;
  };
};

const GET_CART_FOR_CHECKOUT = `
query GetCartForCheckout($customerId: uuid!) {
  cart_items(
    where: { customer_id: { _eq: $customerId } }
    order_by: { created_at: asc }
  ) {
    id
    customer_id
    product_id
    quantity
    product {
      id
      name
      price
      is_active
      inventory {
        stock
      }
    }
  }
}
`;

const CREATE_ORDER = `
mutation CreateOrder($customerId: uuid!, $totalAmount: numeric!) {
  insert_orders_one(
    object: {
      customer_id: $customerId
      total_amount: $totalAmount
      status: "pending"
    }
  ) {
    id
    total_amount
    status
  }
}
`;

const INSERT_ORDER_ITEMS = `
mutation InsertOrderItems($items: [order_items_insert_input!]!) {
  insert_order_items(objects: $items) {
    affected_rows
  }
}
`;

const CREATE_PAYMENT = `
mutation CreatePayment(
  $orderId: uuid!
  $provider: String!
  $providerRef: String
  $amount: numeric!
  $status: String!
) {
  insert_payments_one(
    object: {
      order_id: $orderId
      provider: $provider
      provider_ref: $providerRef
      amount: $amount
      status: $status
    }
  ) {
    id
    status
  }
}
`;

const UPDATE_ORDER_STATUS = `
mutation UpdateOrderStatus($orderId: uuid!, $status: String!) {
  update_orders(
    where: { id: { _eq: $orderId } }
    _set: { status: $status }
  ) {
    affected_rows
  }
}
`;

const DECREMENT_INVENTORY = `
mutation DecrementInventory($productId: uuid!, $quantity: Int!) {
  update_inventory(
    where: { product_id: { _eq: $productId } }
    _inc: { stock: $quantity }
  ) {
    affected_rows
  }
}
`;

const CLEAR_CUSTOMER_CART = `
mutation ClearCustomerCart($customerId: uuid!) {
  delete_cart_items(where: { customer_id: { _eq: $customerId } }) {
    affected_rows
  }
}
`;

export async function loadCartForCheckout(customerId: string) {
  return hasuraAdminRequest<GetCartForCheckoutResponse>(GET_CART_FOR_CHECKOUT, { customerId });
}

export function validateCartForCheckout(cartItems: CartCheckoutItem[]) {
  if (cartItems.length === 0) {
    return { ok: false as const, status: 400, message: "Cart is empty." };
  }

  const invalidProducts = cartItems.filter((item) => !item.product?.is_active);
  if (invalidProducts.length > 0) {
    return {
      ok: false as const,
      status: 400,
      message: "Some cart items are no longer available."
    };
  }

  const outOfStockItems = cartItems
    .filter((item) => {
      const availableStock = item.product?.inventory?.stock ?? 0;
      return availableStock < item.quantity;
    })
    .map((item) => item.product?.name ?? "Unknown item");

  if (outOfStockItems.length > 0) {
    return {
      ok: false as const,
      status: 400,
      message: `Insufficient stock for: ${outOfStockItems.join(", ")}`
    };
  }

  return { ok: true as const };
}

export function calculateTotalAmount(cartItems: CartCheckoutItem[]) {
  return cartItems.reduce((sum, item) => {
    const unitPrice = Number(item.product?.price ?? 0);
    return sum + unitPrice * item.quantity;
  }, 0);
}

export async function createPendingOrder(customerId: string, totalAmount: number) {
  const createOrderResult = await hasuraAdminRequest<CreateOrderResponse>(CREATE_ORDER, {
    customerId,
    totalAmount
  });
  return createOrderResult.insert_orders_one.id;
}

export async function insertOrderItems(orderId: string, cartItems: CartCheckoutItem[]) {
  const orderItemsPayload = cartItems.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: Number(item.product?.price ?? 0)
  }));

  await hasuraAdminRequest<InsertOrderItemsResponse>(INSERT_ORDER_ITEMS, {
    items: orderItemsPayload
  });
}

export async function createSuccessfulPayment(orderId: string, totalAmount: number) {
  const paymentRef = `demo-${Date.now()}`;
  await hasuraAdminRequest<CreatePaymentResponse>(CREATE_PAYMENT, {
    orderId,
    provider: "demo",
    providerRef: paymentRef,
    amount: totalAmount,
    status: "success"
  });
}

export async function setOrderStatus(orderId: string, status: string) {
  await hasuraAdminRequest<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, {
    orderId,
    status
  });
}

export async function decrementInventoryFromCart(cartItems: CartCheckoutItem[]) {
  for (const item of cartItems) {
    await hasuraAdminRequest(DECREMENT_INVENTORY, {
      productId: item.product_id,
      quantity: -item.quantity
    });
  }
}

export async function clearCustomerCart(customerId: string) {
  await hasuraAdminRequest(CLEAR_CUSTOMER_CART, { customerId });
}
