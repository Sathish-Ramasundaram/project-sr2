import type { RefObject } from 'react';

type PaymentConfirmationProps = {
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  sectionRef?: RefObject<HTMLElement | null>;
};

function PaymentConfirmation({
  onPlaceOrder,
  isPlacingOrder,
  sectionRef,
}: PaymentConfirmationProps) {
  return (
    <section
      ref={sectionRef}
      className="mx-6 mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/20"
    >
      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
        Payment Confirmation
      </h3>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        Demo mode: click below to simulate payment success and place order.
      </p>
      <button
        type="button"
        disabled={isPlacingOrder}
        onClick={onPlaceOrder}
        className="mt-3 rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-70 dark:bg-amber-600 dark:hover:bg-amber-500"
      >
        {isPlacingOrder ? 'Placing Order...' : 'Pay and Place Order'}
      </button>
    </section>
  );
}

export default PaymentConfirmation;
