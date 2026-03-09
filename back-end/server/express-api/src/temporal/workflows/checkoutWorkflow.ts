import { proxyActivities, sleep } from "@temporalio/workflow";
import type {
  CheckoutInput,
  CheckoutPrepared,
  prepareCheckout,
  processPayment,
  finalizeOrder,
  markPaymentFailed,
} from "../activities/checkoutActivities";

const activities = proxyActivities<{
  prepareCheckout: typeof prepareCheckout;
  processPayment: typeof processPayment;
  finalizeOrder: typeof finalizeOrder;
  markPaymentFailed: typeof markPaymentFailed;
}>({
  startToCloseTimeout: "1 minute",
  retry: {
    initialInterval: "1 second",
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export type CheckoutWorkflowResult = {
  orderId: string;
  totalAmount: number;
  paymentStatus: "success";
  message: string;
};

export async function checkoutWorkflow(input: CheckoutInput): Promise<CheckoutWorkflowResult> {
  let prepared: CheckoutPrepared | null = null;

  try {
    prepared = await activities.prepareCheckout(input);

    await sleep("15 seconds");

    await activities.processPayment(prepared.orderId, prepared.totalAmount);
    await activities.finalizeOrder(input.customerId, prepared.cartItems);

    return {
      orderId: prepared.orderId,
      totalAmount: prepared.totalAmount,
      paymentStatus: "success",
      message: "Order placed successfully.",
    };
  } catch (error) {
    if (prepared?.orderId) {
      try {
        await activities.markPaymentFailed(prepared.orderId);
      } catch {
        // keep original workflow error
      }
    }
    throw error;
  }
}
