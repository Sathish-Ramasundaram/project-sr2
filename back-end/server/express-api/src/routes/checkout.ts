import { Router } from "express";
import { hasuraAdminRequest } from "../lib/hasuraClient";

const checkoutRouter = Router();

type CheckoutAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
};

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

const isAddressValid = (address: CheckoutAddress): boolean => {
  return Boolean(
    address.fullName?.trim() &&
      address.phone?.trim() &&
      address.line1?.trim() &&
      address.city?.trim() &&
      address.pincode?.trim()
  );
};

checkoutRouter.post("/place-order", async (req, res) => {
  const { customerId, address } = req.body as {
    customerId?: string;
    address?: CheckoutAddress;
  };

  if (!customerId || !address) {
    res.status(400).json({ message: "customerId and address are required." });
    return;
  }

  if (!isAddressValid(address)) {
    res.status(400).json({ message: "Delivery address is incomplete." });
    return;
  }

  let orderId: string | null = null;

  try {
    const cartData = await hasuraAdminRequest<GetCartForCheckoutResponse>(
      GET_CART_FOR_CHECKOUT,
      { customerId }
    );

    if (cartData.cart_items.length === 0) {
      res.status(400).json({ message: "Cart is empty." });
      return;
    }

    const invalidProducts = cartData.cart_items.filter((item) => !item.product?.is_active);
    if (invalidProducts.length > 0) {
      res.status(400).json({ message: "Some cart items are no longer available." });
      return;
    }

    const outOfStockItems = cartData.cart_items
      .filter((item) => {
        const availableStock = item.product?.inventory?.stock ?? 0;
        return availableStock < item.quantity;
      })
      .map((item) => item.product?.name ?? "Unknown item");

    if (outOfStockItems.length > 0) {
      res.status(400).json({
        message: `Insufficient stock for: ${outOfStockItems.join(", ")}`
      });
      return;
    }

    const totalAmount = cartData.cart_items.reduce((sum, item) => {
      const unitPrice = Number(item.product?.price ?? 0);
      return sum + unitPrice * item.quantity;
    }, 0);

    const createOrderResult = await hasuraAdminRequest<CreateOrderResponse>(
      CREATE_ORDER,
      {
        customerId,
        totalAmount
      }
    );

    orderId = createOrderResult.insert_orders_one.id;

    const orderItemsPayload = cartData.cart_items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: Number(item.product?.price ?? 0)
    }));

    await hasuraAdminRequest<InsertOrderItemsResponse>(INSERT_ORDER_ITEMS, {
      items: orderItemsPayload
    });

    const paymentRef = `demo-${Date.now()}`;
    await hasuraAdminRequest<CreatePaymentResponse>(CREATE_PAYMENT, {
      orderId,
      provider: "demo",
      providerRef: paymentRef,
      amount: totalAmount,
      status: "success"
    });

    await hasuraAdminRequest<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, {
      orderId,
      status: "paid"
    });

    for (const item of cartData.cart_items) {
      await hasuraAdminRequest(DECREMENT_INVENTORY, {
        productId: item.product_id,
        quantity: -item.quantity
      });
    }

    await hasuraAdminRequest(CLEAR_CUSTOMER_CART, { customerId });

    res.status(201).json({
      orderId,
      totalAmount,
      paymentStatus: "success",
      message: "Order placed successfully."
    });
  } catch (error) {
    if (orderId) {
      try {
        await hasuraAdminRequest<UpdateOrderStatusResponse>(UPDATE_ORDER_STATUS, {
          orderId,
          status: "payment_failed"
        });
      } catch {
        // Do not override the original error response.
      }
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Checkout failed."
    });
  }
});

export default checkoutRouter;
