import { FormEvent, useState } from 'react';
import type { RefObject } from 'react';
import type { PaymentDetails } from '@/pages/customer-cart/types';

type PaymentConfirmationProps = {
  onPlaceOrder: (details: PaymentDetails) => void;
  isPlacingOrder: boolean;
  sectionRef?: RefObject<HTMLElement | null>;
};

function PaymentConfirmation({
  onPlaceOrder,
  isPlacingOrder,
  sectionRef,
}: PaymentConfirmationProps) {
  const [cardNumber, setCardNumber] = useState('1234567890123456');
  const [expiryDate, setExpiryDate] = useState('12/12');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const normalizedCard = cardNumber.replace(/\s+/g, '');
    const normalizedExpiry = expiryDate.trim();
    const normalizedCvv = cvv.trim();

    if (!/^\d{16}$/.test(normalizedCard)) {
      setFormError('Enter a valid 16-digit card number.');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(normalizedExpiry)) {
      setFormError('Enter expiry in MM/YY format.');
      return;
    }

    if (!/^\d{3,4}$/.test(normalizedCvv)) {
      setFormError('Enter a valid CVV.');
      return;
    }

    onPlaceOrder({
      cardNumber: normalizedCard,
      expiryDate: normalizedExpiry,
      cvv: normalizedCvv,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="mx-6 mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/20"
    >
      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
        Payment Confirmation
      </h3>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        Enter payment details and place order.
      </p>
      <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="card-number"
            className="block text-sm font-medium text-amber-900 dark:text-amber-100"
          >
            Card Number
          </label>
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234123412341234"
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            disabled={isPlacingOrder}
            className="mt-1 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-amber-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="card-expiry"
              className="block text-sm font-medium text-amber-900 dark:text-amber-100"
            >
              Expiry Date
            </label>
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              disabled={isPlacingOrder}
              className="mt-1 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-amber-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="card-cvv"
              className="block text-sm font-medium text-amber-900 dark:text-amber-100"
            >
              CVV Number
            </label>
            <input
              id="card-cvv"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvv}
              onChange={(event) => setCvv(event.target.value)}
              disabled={isPlacingOrder}
              className="mt-1 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-amber-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {formError ? (
          <p className="text-sm text-rose-700 dark:text-rose-300">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPlacingOrder}
          className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-70 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {isPlacingOrder ? 'Processing Payment...' : 'Pay and Place Order'}
        </button>
      </form>
    </section>
  );
}

export default PaymentConfirmation;
