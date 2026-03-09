import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import NotificationBellButton from '@/components/customer/NotificationBellButton';
import PageMain from '@/components/PageMain';
import PageShell from '@/components/PageShell';
import CartItemsList from '@/components/customer-cart/CartItemsList';
import CheckoutAddressForm from '@/components/customer-cart/CheckoutAddressForm';
import PaymentConfirmation from '@/components/customer-cart/PaymentConfirmation';
import StoreLogo from '@/components/StoreLogo';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { logout } from '@/store/auth/authSlice';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useCartData } from '@/pages/customer-cart/useCartData';
import { useCheckoutFlow } from '@/pages/customer-cart/useCheckoutFlow';
import type { PaymentDetails } from '@/pages/customer-cart/types';

function CustomerCartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);

  const {
    cartItems,
    cartError,
    isLoading,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveItem,
    refreshCartItems,
  } = useCartData();

  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    address,
    setAddress,
    showPaymentStep,
    checkoutError,
    checkoutInfo,
    isPlacingOrder,
    couponCode,
    setCouponCode,
    appliedDiscount,
    couponError,
    couponInfo,
    deliveryAddressRef,
    paymentConfirmationRef,
    handleAddressSubmit,
    applyCoupon,
    handlePlaceOrder: placeOrder,
  } = useCheckoutFlow();

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    dispatch(loadCartCountRequest({ customerId: user.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (isCheckoutOpen && cartItems.length > 0) {
      window.requestAnimationFrame(() => {
        deliveryAddressRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [isCheckoutOpen, cartItems.length, deliveryAddressRef]);

  useEffect(() => {
    if (showPaymentStep) {
      window.requestAnimationFrame(() => {
        paymentConfirmationRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [showPaymentStep, paymentConfirmationRef]);

  const totalAmount = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.product?.price ?? 0);
        return sum + price * item.quantity;
      }, 0),
    [cartItems]
  );
  const customerName = user?.name?.trim() || 'Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handlePlaceOrderWithCallback = async (paymentDetails: PaymentDetails) => {
    const isSuccess = await placeOrder(cartItems, paymentDetails);
    if (isSuccess) {
      await refreshCartItems();
    }
  };

  return (
    <PageShell>
      <AppHeader
        left={
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
        }
        right={
          <div className="flex items-center gap-3">
            <div
              title={customerName}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-700 text-xs font-semibold text-white dark:bg-sky-500 dark:text-slate-900"
            >
              {customerInitial}
            </div>
            <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium dark:bg-slate-700">
              Cart: {cartCount}
            </span>
            <button
              type="button"
              onClick={() => navigate('/customer/orders')}
              className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Orders
            </button>
            <NotificationBellButton customerId={user?.id} />
            <ThemeToggleButton />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Logout
            </button>
          </div>
        }
      />

      <PageMain className="px-0">
        <div className="mb-5 flex items-center justify-between">
          <div className="px-6">
            <h2 className="text-2xl font-bold">My Cart</h2>
          </div>
          <div className="px-6">
            <Link
              to="/customer/home"
              className="text-sm text-sky-700 hover:underline dark:text-sky-400"
            >
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
              <CartItemsList
                cartItems={cartItems}
                onIncreaseQuantity={handleIncreaseQuantity}
                onDecreaseQuantity={handleDecreaseQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </article>

            <article className="rounded-lg border border-slate-300 bg-white p-4 lg:col-span-4 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="text-lg font-semibold">Proceed to Order</h3>
              <div className="mt-4 border-b border-slate-200 pb-3 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Total ({cartItems.length} item type
                    {cartItems.length > 1 ? 's' : ''})
                  </p>
                  <div className="text-right">
                    {appliedDiscount > 0 ? (
                      <p className="text-sm text-slate-500 line-through dark:text-slate-400">
                        {'\u20B9'}{totalAmount}
                      </p>
                    ) : null}
                    <p className="text-lg font-bold">
                      {'\u20B9'}{Math.max(0, totalAmount - appliedDiscount)}
                    </p>
                  </div>
                </div>
                {appliedDiscount > 0 ? (
                  <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                    Discount: {'\u20B9'}{appliedDiscount}
                  </p>
                ) : null}
              </div>

              {isCheckoutOpen ? (
                <div className="mt-4">
                  <label
                    htmlFor="coupon-code"
                    className="block text-sm font-medium"
                  >
                    Coupon Code
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="coupon-code"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                      placeholder="Enter coupon code"
                    />
                    <button
                      type="button"
                      onClick={() => user?.id && applyCoupon(totalAmount, user.id)}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError ? (
                    <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                      {couponError}
                    </p>
                  ) : null}
                  {couponInfo ? (
                    <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                      {couponInfo}
                    </p>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                  Proceed to Order
                </button>
              )}
            </article>
          </section>
        )}

        {isCheckoutOpen && cartItems.length > 0 ? (
          <CheckoutAddressForm
            address={address}
            onAddressChange={setAddress}
            onSubmit={handleAddressSubmit}
            sectionRef={deliveryAddressRef}
          />
        ) : null}

        {showPaymentStep ? (
          <PaymentConfirmation
            onPlaceOrder={handlePlaceOrderWithCallback}
            isPlacingOrder={isPlacingOrder}
            sectionRef={paymentConfirmationRef}
          />
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
      </PageMain>
    </PageShell>
  );
}

export default CustomerCartPage;
