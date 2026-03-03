import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { graphqlRequest } from "../api/graphqlClient";
import {
  GET_ACTIVE_PRODUCTS_WITH_INVENTORY
} from "../api/operations";
import AppHeader from "../components/AppHeader";
import ProductCard from "../components/ProductCard";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { logout } from "../store/auth/authSlice";
import {
  addToCartRequest,
  clearCartFeedback,
  loadCartCountRequest
} from "../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { syncInventoryProducts } from "../store/inventory/inventorySlice";
import type { Product } from "../types/product";

type HasuraProductsResponse = {
  products: Array<{
    id: string;
    name: string;
    image_url: string;
    unit: string;
    price: number;
    inventory: Array<{ stock: number }>;
  }>;
};

function CustomerHomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const inventoryItems = useAppSelector((state) => state.inventory.items);
  const cartCount = useAppSelector((state) => state.cart.count);
  const cartInfo = useAppSelector((state) => state.cart.info);
  const cartError = useAppSelector((state) => state.cart.error);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (cartInfo) {
      setCartMessage(cartInfo);
      dispatch(clearCartFeedback());
      return;
    }

    if (cartError) {
      setCartMessage(cartError);
      dispatch(clearCartFeedback());
    }
  }, [cartError, cartInfo, dispatch]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsError(null);
        const data = await graphqlRequest<HasuraProductsResponse>(
          GET_ACTIVE_PRODUCTS_WITH_INVENTORY
        );

        const mappedProducts: Product[] = data.products.map((product) => ({
          id: product.id,
          name: product.name,
          imageUrl: product.image_url,
          quantity: product.unit,
          price: Number(product.price),
          description: ""
        }));

        setProducts(mappedProducts);
        dispatch(syncInventoryProducts(mappedProducts.map((product) => product.id)));
      } catch (error) {
        setProductsError(error instanceof Error ? error.message : "Something went wrong");
      }
    };

    void loadProducts();
  }, [dispatch]);

  const handleAddToCart = (productId: string) => {
    const inventory = inventoryItems.find((item) => item.productId === productId);
    if (!inventory || inventory.stock <= 0) {
      setCartMessage("Item is out of stock in godown.");
      return;
    }

    if (!user?.id) {
      setCartMessage("Customer not found for cart update.");
      return;
    }
    dispatch(addToCartRequest({ customerId: user.id, productId }));
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
              className="h-12 mt-1"
              imgClassName="h-12 w-auto"
              textClassName="text-xl font-bold"
            />
          </div>
        )}
        right={(
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium dark:bg-slate-700">Cart: {cartCount}</span>
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
        {cartMessage && <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">{cartMessage}</p>}
        {productsError && <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{productsError}</p>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              showImage={!hiddenPhotoProductIds.has(product.id)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default CustomerHomePage;

