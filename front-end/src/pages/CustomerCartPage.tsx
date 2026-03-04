import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { graphqlRequest } from "../api/graphqlClient";
import { DELETE_CART_ITEM, GET_MY_CART, UPDATE_CART_ITEM_QUANTITY } from "../api/operations";
import AppHeader from "../components/AppHeader";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { formatBackendError } from "../utils/apiError";
import { logout } from "../store/auth/authSlice";
import { loadCartCountRequest } from "../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { orderPaid } from "../store/inventory/inventorySlice";

type CartItemResponse = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    unit: string;
    price: number;
    is_active: boolean;
  } | null;
};

type GetMyCartResponse = {
  cart_items: CartItemResponse[];
};

type PlaceOrderResponse = {
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  message: string;
};

type CheckoutAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
};

const initialAddress: CheckoutAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  pincode: ""
};

function CustomerCartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);
  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState<CheckoutAddress>(initialAddress);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutInfo, setCheckoutInfo] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const refreshCartItems = async () => {
    try {
      setCartError(null);
      setIsLoading(true);
      const data = await graphqlRequest<GetMyCartResponse>(GET_MY_CART);
      const filtered = data.cart_items.filter((item) => item.product?.is_active);
      setCartItems(filtered);
    } catch (error) {
      setCartItems([]);
      setCartError(formatBackendError(error, "cart items"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    void refreshCartItems();
  }, []);

  const totalAmount = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.product?.price ?? 0);
        return sum + price * item.quantity;
      }, 0),
    [cartItems]
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError(null);
    setCheckoutInfo(null);
    setShowPaymentStep(true);
  };

  const handleIncreaseQuantity = async (cartItemId: string) => {
    const target = cartItems.find((item) => item.id === cartItemId);
    if (!target || !user?.id || !target.product?.id) {
      return;
    }

    try {
      setCartError(null);
      await graphqlRequest(UPDATE_CART_ITEM_QUANTITY, {
        customerId: user.id,
        productId: target.product.id,
        quantity: target.quantity + 1
      });
      await refreshCartItems();
      dispatch(loadCartCountRequest({ customerId: user.id }));
    } catch (error) {
      setCartError(formatBackendError(error, "cart update"));
    }
  };

  const handleDecreaseQuantity = async (cartItemId: string) => {
    const target = cartItems.find((item) => item.id === cartItemId);
    if (!target || !user?.id || !target.product?.id) {
      return;
    }

    try {
      setCartError(null);
      if (target.quantity <= 1) {
        await graphqlRequest(DELETE_CART_ITEM, { cartItemId });
      } else {
        await graphqlRequest(UPDATE_CART_ITEM_QUANTITY, {
          customerId: user.id,
          productId: target.product.id,
          quantity: target.quantity - 1
        });
      }
      await refreshCartItems();
      dispatch(loadCartCountRequest({ customerId: user.id }));
    } catch (error) {
      setCartError(formatBackendError(error, "cart update"));
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      setCartError(null);
      await graphqlRequest(DELETE_CART_ITEM, { cartItemId });
      await refreshCartItems();
      dispatch(loadCartCountRequest({ customerId: user.id }));
    } catch (error) {
      setCartError(formatBackendError(error, "cart update"));
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      setCheckoutError("Customer not found for checkout.");
      return;
    }

    try {
      setCheckoutError(null);
      setCheckoutInfo(null);
      setIsPlacingOrder(true);

      const response = await fetch("http://localhost:5000/api/checkout/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: user.id,
          address
        })
      });

      const responseBody = (await response.json()) as PlaceOrderResponse | { message?: string };
      if (!response.ok) {
        throw new Error(
          "message" in responseBody && responseBody.message
            ? responseBody.message
            : "Failed to place order."
        );
      }

      const result = responseBody as PlaceOrderResponse;
      const purchasedItems = cartItems
        .filter((item) => item.product?.id)
        .map((item) => ({
          productId: item.product!.id,
          quantity: item.quantity
        }));

      dispatch(orderPaid(purchasedItems));
      setCheckoutInfo(
        `${result.message} Order ID: ${result.orderId}. Payment: ${result.paymentStatus}.`
      );
      setCartItems([]);
      setShowPaymentStep(false);
      setIsCheckoutOpen(false);
      setAddress(initialAddress);
      dispatch(loadCartCountRequest({ customerId: user.id }));
    } catch (error) {
      setCheckoutError(formatBackendError(error, "checkout"));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={(
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
        )}
        right={(
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium dark:bg-slate-700">
              Cart: {cartCount}
            </span>
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

      <main className="w-full px-0 py-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="px-6">
            <h2 className="text-2xl font-bold">My Cart</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Customer: {user?.name ?? "Customer"}
            </p>
          </div>
          <div className="px-6">
            <Link to="/customer/home" className="text-sm text-sky-700 hover:underline dark:text-sky-400">
              Continue Shopping
            </Link>
          </div>
        </div>

        {isLoading ? (
          <p className="mx-6 rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading cart items...
          </p>
        ) : cartError ? (
          <p className="mx-6 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            {cartError}
          </p>
        ) : cartItems.length === 0 ? (
          <p className="mx-6 rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Your cart is empty.
          </p>
        ) : (
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
                            onClick={() => void handleDecreaseQuantity(item.id)}
                            className="h-8 w-8 rounded-md bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                          >
                            -
                          </button>
                          <span className="inline-flex min-w-[40px] items-center justify-center rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleIncreaseQuantity(item.id)}
                            className="h-8 w-8 rounded-md bg-slate-900 text-sm font-bold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRemoveItem(item.id)}
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
                  onClick={() => setIsCheckoutOpen(true)}
                  className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                  Proceed to Order
                </button>
              ) : null}
            </article>
          </section>
        )}

        {isCheckoutOpen && cartItems.length > 0 ? (
          <section className="mx-6 mt-6 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold">Delivery Address</h3>
            <form onSubmit={handleAddressSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                required
                value={address.fullName}
                onChange={(event) => setAddress((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Full Name"
                className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
              <input
                required
                value={address.phone}
                onChange={(event) => setAddress((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Phone Number"
                className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
              <input
                required
                value={address.line1}
                onChange={(event) => setAddress((current) => ({ ...current, line1: event.target.value }))}
                placeholder="Address Line 1"
                className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 md:col-span-2"
              />
              <input
                value={address.line2}
                onChange={(event) => setAddress((current) => ({ ...current, line2: event.target.value }))}
                placeholder="Address Line 2 (Optional)"
                className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 md:col-span-2"
              />
              <input
                required
                value={address.city}
                onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))}
                placeholder="City"
                className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
              <input
                required
                value={address.pincode}
                onChange={(event) => setAddress((current) => ({ ...current, pincode: event.target.value }))}
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
        ) : null}

        {showPaymentStep ? (
          <section className="mx-6 mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/20">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Payment Confirmation</h3>
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
              Demo mode: click below to simulate payment success and place order.
            </p>
            <button
              type="button"
              disabled={isPlacingOrder}
              onClick={handlePlaceOrder}
              className="mt-3 rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-70 dark:bg-amber-600 dark:hover:bg-amber-500"
            >
              {isPlacingOrder ? "Placing Order..." : "Pay and Place Order"}
            </button>
          </section>
        ) : null}

        {checkoutError ? (
          <p className="mx-6 mt-4 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            {checkoutError}
          </p>
        ) : null}

        {checkoutInfo ? (
          <p className="mx-6 mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
            {checkoutInfo}
          </p>
        ) : null}
      </main>
    </div>
  );
}

export default CustomerCartPage;
