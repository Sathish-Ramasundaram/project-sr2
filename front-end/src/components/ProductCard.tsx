import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string) => void;
  onDecreaseCart: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
  cartQuantity: number;
  isOutOfStock?: boolean;
  isCartUpdating?: boolean;
  showImage?: boolean;
  feedback?: {
    text: string;
    tone: "success" | "error";
  } | null;
};

function ProductCard({
  product,
  onAddToCart,
  onDecreaseCart,
  onRemoveFromCart,
  cartQuantity,
  isOutOfStock = false,
  isCartUpdating = false,
  showImage = true,
  feedback = null
}: ProductCardProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
      {showImage ? (
        <img src={product.imageUrl} alt={product.name} className="h-36 w-full rounded-md object-cover" />
      ) : (
        <div aria-hidden="true" className="h-36 w-full rounded-md bg-slate-100 dark:bg-slate-700" />
      )}
      <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-sm text-slate-700 dark:text-slate-300">Quantity: {product.quantity}</p>
        <Link to={`/customer/product/${product.id}`} className="text-sm font-normal text-sky-700 hover:underline dark:text-sky-400">
          More details
        </Link>
      </div>
      <div className="mt-2 grid grid-cols-2 items-center gap-2">
        <p className="text-base font-semibold">
          {"\u20B9"}
          {product.price}
        </p>
        <div className="text-right">
          {isOutOfStock ? (
            <span className="text-sm text-rose-600 dark:text-rose-400">Out of stock</span>
          ) : cartQuantity > 0 ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isCartUpdating}
                onClick={() => onDecreaseCart(product.id)}
                className="h-8 w-8 rounded-md bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                -
              </button>
              <span className="inline-flex min-w-[40px] items-center justify-center rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600">
                {cartQuantity}
              </span>
              <button
                type="button"
                disabled={isCartUpdating}
                onClick={() => onAddToCart(product.id)}
                className="h-8 w-8 rounded-md bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                +
              </button>
              <button
                type="button"
                disabled={isCartUpdating}
                onClick={() => onRemoveFromCart(product.id)}
                className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-70 dark:text-rose-400"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isCartUpdating}
              onClick={() => onAddToCart(product.id)}
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
