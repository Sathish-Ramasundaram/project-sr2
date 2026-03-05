import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types/product';

type ProductGridProps = {
  products: Product[];
  stockByProductId: Record<string, number>;
  cartByProductId: Record<string, { cartItemId: string; quantity: number }>;
  cartLoadingProductId: string | null;
  inlineCartFeedback: {
    productId: string;
    text: string;
    tone: 'success' | 'error';
  } | null;
  onAddToCart: (productId: string, stock: number) => void;
  onDecreaseCart: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
};

function ProductGrid({
  products,
  stockByProductId,
  cartByProductId,
  cartLoadingProductId,
  inlineCartFeedback,
  onAddToCart,
  onDecreaseCart,
  onRemoveFromCart,
}: ProductGridProps) {
  const hiddenPhotoProductIds = new Set<string>([]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={(productId) =>
            onAddToCart(productId, stockByProductId[productId] ?? 0)
          }
          onDecreaseCart={onDecreaseCart}
          onRemoveFromCart={onRemoveFromCart}
          cartQuantity={cartByProductId[product.id]?.quantity ?? 0}
          isOutOfStock={(stockByProductId[product.id] ?? 0) <= 0}
          isCartUpdating={cartLoadingProductId === product.id}
          showImage={!hiddenPhotoProductIds.has(product.id)}
          feedback={
            inlineCartFeedback && inlineCartFeedback.productId === product.id
              ? { text: inlineCartFeedback.text, tone: inlineCartFeedback.tone }
              : null
          }
        />
      ))}
    </section>
  );
}

export default ProductGrid;
