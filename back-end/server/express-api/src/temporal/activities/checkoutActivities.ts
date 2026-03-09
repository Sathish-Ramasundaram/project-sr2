import {
  loadCartForCheckout,
  validateCartForCheckout,
  calculateTotalAmount,
  createPendingOrder,
  insertOrderItems,
  createSuccessfulPayment,
  setOrderStatus,
  decrementInventoryFromCart,
  clearCustomerCart,
} from "../../modules/checkout/checkoutService";

export type CheckoutInput = {
  customerId: string;
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    pincode: string;
  };
};

export type CheckoutPrepared = {
  orderId: string;
  totalAmount: number;
  cartItems: Awaited<ReturnType<typeof loadCartForCheckout>>["cart_items"];
};

export async function prepareCheckout(input: CheckoutInput): Promise<CheckoutPrepared> {
  const cartData = await loadCartForCheckout(input.customerId);

  const validation = validateCartForCheckout(cartData.cart_items);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const totalAmount = calculateTotalAmount(cartData.cart_items);
  const orderId = await createPendingOrder(input.customerId, totalAmount);
  await insertOrderItems(orderId, cartData.cart_items);

  return {
    orderId,
    totalAmount,
    cartItems: cartData.cart_items,
  };
}

export async function processPayment(orderId: string, totalAmount: number) {
  await createSuccessfulPayment(orderId, totalAmount);
  await setOrderStatus(orderId, "paid");
}

export async function finalizeOrder(customerId: string, cartItems: CheckoutPrepared["cartItems"]) {
  await decrementInventoryFromCart(cartItems);
  await clearCustomerCart(customerId);
}

export async function markPaymentFailed(orderId: string) {
  await setOrderStatus(orderId, "payment_failed");
}
