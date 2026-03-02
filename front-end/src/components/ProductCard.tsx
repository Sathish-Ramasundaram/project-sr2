import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string) => void;
  showImage?: boolean;
};

function ProductCard({ product, onAddToCart, showImage = true }: ProductCardProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
      {showImage ? (
        <img src={product.imageUrl} alt={product.name} className="h-36 w-full rounded-md object-cover" />
      ) : (
        <div aria-hidden="true" className="h-36 w-full rounded-md bg-slate-100 dark:bg-slate-700" />
      )}
      <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Quantity: {product.quantity}</p>
      <p className="mt-1 text-sm font-medium">
        {"\u20B9"}
        {product.price}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Link to={`/customer/product/${product.id}`} className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400">
          More details
        </Link>
        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;