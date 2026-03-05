import type { FormEvent, RefObject } from 'react';
import type { CheckoutAddress } from '@/pages/customer-cart/types';

type CheckoutAddressFormProps = {
  address: CheckoutAddress;
  onAddressChange: (address: CheckoutAddress) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sectionRef?: RefObject<HTMLElement | null>;
};

function CheckoutAddressForm({
  address,
  onAddressChange,
  onSubmit,
  sectionRef,
}: CheckoutAddressFormProps) {
  return (
    <section
      ref={sectionRef}
      className="mx-6 mt-6 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
    >
      <h3 className="text-lg font-semibold">Delivery Address</h3>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          required
          value={address.fullName}
          onChange={(event) =>
            onAddressChange({ ...address, fullName: event.target.value })
          }
          placeholder="Full Name"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
        />
        <input
          required
          value={address.phone}
          onChange={(event) =>
            onAddressChange({ ...address, phone: event.target.value })
          }
          placeholder="Phone Number"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
        />
        <input
          required
          value={address.line1}
          onChange={(event) =>
            onAddressChange({ ...address, line1: event.target.value })
          }
          placeholder="Address Line 1"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 md:col-span-2"
        />
        <input
          value={address.line2}
          onChange={(event) =>
            onAddressChange({ ...address, line2: event.target.value })
          }
          placeholder="Address Line 2 (Optional)"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 md:col-span-2"
        />
        <input
          required
          value={address.city}
          onChange={(event) =>
            onAddressChange({ ...address, city: event.target.value })
          }
          placeholder="City"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
        />
        <input
          required
          value={address.pincode}
          onChange={(event) =>
            onAddressChange({ ...address, pincode: event.target.value })
          }
          placeholder="Pincode"
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 md:col-span-2"
        >
          Continue to Payment
        </button>
      </form>
    </section>
  );
}

export default CheckoutAddressForm;
