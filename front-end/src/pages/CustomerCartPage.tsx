import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
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
    deliveryAddressRef,
    paymentConfirmationRef,
    handleAddressSubmit,
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handlePlaceOrderWithCallback = async () => {
    await placeOrder(cartItems);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
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
        }
      />

      <main className="w-full px-0 py-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="px-6">
            <h2 className="text-2xl font-bold">My Cart</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Customer: {user?.name ?? 'Customer'}
            </p>
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
              <div className="mt-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Total ({cartItems.length} item type
                  {cartItems.length > 1 ? 's' : ''})
                </p>
                <p className="text-lg font-bold">
                  {'\u20B9'}
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
      </main>
    </div>
  );
}

export default CustomerCartPage;
