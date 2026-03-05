import type { CartItemResponse } from "@/pages/customer-cart/types";

type CustomerCartItemsAndSummaryProps = {
  isLoading: boolean;
  cartError: string | null;
  cartItems: CartItemResponse[];
  totalAmount: number;
  isCheckoutOpen: boolean;
  onProceedToOrder: () => void;
  onIncreaseQuantity: (cartItemId: string) => void;
  onDecreaseQuantity: (cartItemId: string) => void;
  onRemoveItem: (cartItemId: string) => void;
};

function CustomerCartItemsAndSummary({
  isLoading,
  cartError,
  cartItems,
  totalAmount,
  isCheckoutOpen,
  onProceedToOrder,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem
}: CustomerCartItemsAndSummaryProps) {
  if (isLoading) {
    return (
      <p className="mx-6 rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Loading cart items...
      </p>
    );
  }

  if (cartError) {
    return (
      <p className="mx-6 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
        {cartError}
      </p>
    );
  }

  if (cartItems.length === 0) {
    return (
      <p className="mx-6 rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Your cart is empty.
      </p>
    );
  }

  return (
    <section className="grid gap-6 px-6 lg:grid-cols-12">
      <article className="rounded-lg border border-slate-300 bg-white p-4 lg:col-span-8 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold">Cart Details</h3>
        <ul className="mt-3 space-y-3">
          {cartItems.map((item) => (
            <li key={item.id} className="rounded-md border border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.product?.name ?? "Unknown item"}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.product?.unit}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDecreaseQuantity(item.id)}
                      className="h-8 w-8 rounded-md bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    >
                      -
                    </button>
                    <span className="inline-flex min-w-[40px] items-center justify-center rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncreaseQuantity(item.id)}
                      className="h-8 w-8 rounded-md bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-semibold">
                  {"\u20B9"}
                  {Number(item.product?.price ?? 0) * item.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-lg border border-slate-300 bg-white p-4 lg:col-span-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold">Proceed to Order</h3>
        <div className="mt-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Total ({cartItems.length} item type{cartItems.length > 1 ? "s" : ""})
          </p>
          <p className="text-lg font-bold">
            {"\u20B9"}
            {totalAmount}
          </p>
        </div>
        {!isCheckoutOpen ? (
          <button
            type="button"
            onClick={onProceedToOrder}
            className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Proceed to Order
          </button>
        ) : null}
      </article>
    </section>
  );
}

export default CustomerCartItemsAndSummary;
