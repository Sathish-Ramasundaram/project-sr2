import { Request, Response } from "express";
import {
  calculateTotalAmount,
  clearCustomerCart,
  createPendingOrder,
  createSuccessfulPayment,
  decrementInventoryFromCart,
  insertOrderItems,
  loadCartForCheckout,
  setOrderStatus,
  validateCartForCheckout
} from "./checkoutService";
import { toCheckoutAddress } from "./checkoutValidation";

type PlaceOrderResponse = {
  orderId: string;
  totalAmount: number;
  paymentStatus: "success";
  message: string;
};

export async function placeOrderHandler(req: Request, res: Response) {
  const customerId =
    typeof (req.body as { customerId?: unknown } | undefined)?.customerId === "string"
      ? (req.body as { customerId: string }).customerId
      : "";
  const address = toCheckoutAddress((req.body as { address?: unknown } | undefined)?.address);

  if (!customerId || !address) {
    res.status(400).json({ message: "customerId and address are required." });
    return;
  }

  let orderId: string | null = null;

  try {
    const cartData = await loadCartForCheckout(customerId);

    const validation = validateCartForCheckout(cartData.cart_items);
    if (!validation.ok) {
      res.status(validation.status).json({ message: validation.message });
      return;
    }

    const totalAmount = calculateTotalAmount(cartData.cart_items);
    orderId = await createPendingOrder(customerId, totalAmount);
    await insertOrderItems(orderId, cartData.cart_items);
    await createSuccessfulPayment(orderId, totalAmount);
    await setOrderStatus(orderId, "paid");
    await decrementInventoryFromCart(cartData.cart_items);
    await clearCustomerCart(customerId);

    const responseBody: PlaceOrderResponse = {
      orderId,
      totalAmount,
      paymentStatus: "success",
      message: "Order placed successfully."
    };
    res.status(201).json(responseBody);
  } catch (error) {
    if (orderId) {
      try {
        await setOrderStatus(orderId, "payment_failed");
      } catch {
        // Keep original failure response.
      }
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Checkout failed."
    });
  }
}
