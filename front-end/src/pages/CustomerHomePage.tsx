import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { graphqlRequest } from "../api/graphqlClient";
import {
  DELETE_CART_ITEM,
  GET_CART_ITEM_QUANTITY,
  GET_MY_CART,
  INSERT_CART_ITEM,
  UPDATE_CART_ITEM_QUANTITY
} from "../api/operations";
import AppHeader from "../components/AppHeader";
import ProductCard from "../components/ProductCard";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { formatBackendError } from "../utils/apiError";
import { CATALOGUE_SYNC_KEY } from "../utils/catalogueSync";
import { logout } from "../store/auth/authSlice";
import { loadCartCountRequest } from "../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Product } from "../types/product";

type CatalogueProductsResponseItem = {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
};

type MyCartProductsResponse = {
  cart_items: Array<{
    id: string;
    customer_id: string;
    quantity: number;
    product: {
      id: string;
      is_active: boolean;
    } | null;
  }>;
};

type CartItemQuantityResponse = {
  cart_items: Array<{
    id: string;
    quantity: number;
  }>;
};

function CustomerHomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockByProductId, setStockByProductId] = useState<Record<string, number>>({});
  const [cartByProductId, setCartByProductId] = useState<Record<string, { cartItemId: string; quantity: number }>>({});
  const [cartLoadingProductId, setCartLoadingProductId] = useState<string | null>(null);
  const [inlineCartFeedback, setInlineCartFeedback] = useState<{
    productId: string;
    text: string;
    tone: "success" | "error";
  } | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [reloadSignal, setReloadSignal] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const loadMyCartProducts = async () => {
      if (!user?.id) {
        setCartByProductId({});
        return;
      }

      try {
        const data = await graphqlRequest<MyCartProductsResponse>(GET_MY_CART);
        const map: Record<string, { cartItemId: string; quantity: number }> = {};
        data.cart_items
          .filter((item) => item.customer_id === user.id && item.product?.is_active)
          .forEach((item) => {
            if (!item.product) {
              return;
            }
            const existing = map[item.product.id];
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              map[item.product.id] = { cartItemId: item.id, quantity: item.quantity };
            }
          });
        setCartByProductId(map);
      } catch {
        setCartByProductId({});
      }
    };

    void loadMyCartProducts();
  }, [user?.id, cartCount]);

  useEffect(() => {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === CATALOGUE_SYNC_KEY) {
        setReloadSignal((current) => current + 1);
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => {
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsError(null);
        setIsProductsLoading(true);
        const response = await fetch("http://localhost:5000/api/catalogue/products");
        if (!response.ok) {
          throw new Error("Failed to load products");
        }
        const data = (await response.json()) as CatalogueProductsResponseItem[];

        const mappedProducts: Product[] = data.map((product) => ({
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          quantity: product.quantity,
          price: Number(product.price),
          description: product.description ?? ""
        }));
        const stockMap: Record<string, number> = {};
        data.forEach((product) => {
          stockMap[product.id] = Number(product.stock ?? 0);
        });

        setProducts(mappedProducts);
        setStockByProductId(stockMap);
      } catch (error) {
        setProducts([]);
        setStockByProductId({});
        setProductsError(formatBackendError(error, "products"));
      } finally {
        setIsProductsLoading(false);
      }
    };

    void loadProducts();
  }, [reloadSignal]);

  const handleAddToCart = (productId: string) => {
    void (async () => {
      const liveStock = stockByProductId[productId] ?? 0;
      const currentQuantity = cartByProductId[productId]?.quantity ?? 0;
      if (liveStock <= 0 || currentQuantity >= liveStock) {
        setInlineCartFeedback({
          productId,
          text: "Item is out of stock in godown.",
          tone: "error"
        });
        return;
      }

      if (!user?.id) {
        setInlineCartFeedback({
          productId,
          text: "Customer not found for cart update.",
          tone: "error"
        });
        return;
      }

      try {
        setCartLoadingProductId(productId);
        setInlineCartFeedback(null);

        const cartItemData = await graphqlRequest<CartItemQuantityResponse>(
          GET_CART_ITEM_QUANTITY,
          {
            customerId: user.id,
            productId
          }
        );

        const existing = cartItemData.cart_items[0];
        if (!existing) {
          await graphqlRequest(INSERT_CART_ITEM, {
            customerId: user.id,
            productId,
            quantity: 1
          });
        } else {
          await graphqlRequest(UPDATE_CART_ITEM_QUANTITY, {
            customerId: user.id,
            productId,
            quantity: existing.quantity + 1
          });
        }

        dispatch(loadCartCountRequest({ customerId: user.id }));
      } catch (error) {
        const message = formatBackendError(error, "cart update");
        if (message.toLowerCase().includes("out of stock")) {
          setInlineCartFeedback({
            productId,
            text: "Item is out of stock in godown.",
            tone: "error"
          });
        }
      } finally {
        setCartLoadingProductId(null);
      }
    })();
  };

  const handleDecreaseCart = (productId: string) => {
    void (async () => {
      if (!user?.id) {
        return;
      }
      const existing = cartByProductId[productId];
      if (!existing) {
        return;
      }

      try {
        setCartLoadingProductId(productId);
        setInlineCartFeedback(null);
        if (existing.quantity <= 1) {
          await graphqlRequest(DELETE_CART_ITEM, { cartItemId: existing.cartItemId });
        } else {
          await graphqlRequest(UPDATE_CART_ITEM_QUANTITY, {
            customerId: user.id,
            productId,
            quantity: existing.quantity - 1
          });
        }
        dispatch(loadCartCountRequest({ customerId: user.id }));
      } finally {
        setCartLoadingProductId(null);
      }
    })();
  };

  const handleRemoveFromCart = (productId: string) => {
    void (async () => {
      if (!user?.id) {
        return;
      }
      const existing = cartByProductId[productId];
      if (!existing) {
        return;
      }

      try {
        setCartLoadingProductId(productId);
        setInlineCartFeedback(null);
        await graphqlRequest(DELETE_CART_ITEM, { cartItemId: existing.cartItemId });
        dispatch(loadCartCountRequest({ customerId: user.id }));
      } finally {
        setCartLoadingProductId(null);
      }
    })();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const hiddenPhotoProductIds = new Set<string>([]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={(
          <div>
            <StoreLogo
              className="h-12"
              imgClassName="h-12 w-auto"
              textClassName="text-xl font-bold"
            />
          </div>
        )}
        right={(
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/customer/cart")}
              className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Cart: {cartCount}
            </button>
            <ThemeToggleButton />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Logout
            </button>
          </div>
        )}
      />

      <main className="w-full px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Welcome, {user?.name ?? "Customer"}
          </p>
        </div>
        {isProductsLoading ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading products...
          </p>
        ) : productsError ? (
          <p className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            {productsError}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            No products available right now.
          </p>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onDecreaseCart={handleDecreaseCart}
                onRemoveFromCart={handleRemoveFromCart}
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
        )}
      </main>
    </div>
  );
}

export default CustomerHomePage;

