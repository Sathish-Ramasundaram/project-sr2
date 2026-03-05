import type { CartItemResponse } from '@/pages/customer-cart/types';

type CartItemsListProps = {
  cartItems: CartItemResponse[];
  onIncreaseQuantity: (cartItemId: string) => void;
  onDecreaseQuantity: (cartItemId: string) => void;
  onRemoveItem: (cartItemId: string) => void;
};

function CartItemsList({
  cartItems,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
}: CartItemsListProps) {
  return (
    <ul className="mt-3 space-y-3">
      {cartItems.map((item) => (
        <li
          key={item.id}
          className="rounded-md border border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">
                {item.product?.name ?? 'Unknown item'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {item.product?.unit}
              </p>
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
              {'\u20B9'}
              {Number(item.product?.price ?? 0) * item.quantity}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default CartItemsList;
