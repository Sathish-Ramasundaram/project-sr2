import { FormEvent, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatBackendError } from '@/utils/apiError';
import { orderPaid } from '@/store/inventory/inventorySlice';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { graphqlRequest } from '@/api/graphqlClient';
import { APPLY_COUPON } from '@/api/operations';
import type {
  CartItemResponse,
  CheckoutAddress,
  PlaceOrderResponse,
} from '@/pages/customer-cart/types';
import { initialAddress } from '@/pages/customer-cart/types';

export function useCheckoutFlow() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState<CheckoutAddress>(initialAddress);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutInfo, setCheckoutInfo] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const deliveryAddressRef = useRef<HTMLElement | null>(null);
  const paymentConfirmationRef = useRef<HTMLElement | null>(null);

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError(null);
    setCheckoutInfo(null);
    setShowPaymentStep(true);
  };

  const applyCoupon = useCallback(
    async (cartTotal: number, cartId: string) => {
      if (!couponCode.trim()) {
        setCheckoutError('Please enter a coupon code');
        return false;
      }

      try {
        setCheckoutError(null);
        const result = (await graphqlRequest(APPLY_COUPON, {
          input: {
            cart_id: cartId,
            coupon_code: couponCode,
          },
        })) as {
          apply_coupon: {
            success: boolean;
            message: string;
            discount_amount: number;
            final_total: number;
          };
        };

        if (result.apply_coupon.success) {
          setAppliedDiscount(result.apply_coupon.discount_amount);
          setCheckoutInfo(
            `Coupon applied! Discount: ₹${result.apply_coupon.discount_amount}`
          );
          return true;
        } else {
          setCheckoutError(result.apply_coupon.message || 'Invalid coupon');
          return false;
        }
      } catch (error) {
        setCheckoutError(formatBackendError(error, 'coupon application'));
        return false;
      }
    },
    [couponCode]
  );

  const handlePlaceOrder = useCallback(
    async (cartItems: CartItemResponse[]) => {
      if (!user?.id) {
        setCheckoutError('Customer not found for checkout.');
        return;
      }

      try {
        setCheckoutError(null);
        setCheckoutInfo(null);
        setIsPlacingOrder(true);

        const response = await fetch(
          'http://localhost:5000/api/checkout/place-order',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: user.id,
              address,
            }),
          }
        );

        const responseBody = (await response.json()) as
          | PlaceOrderResponse
          | { message?: string };
        if (!response.ok) {
          throw new Error(
            'message' in responseBody && responseBody.message
              ? responseBody.message
              : 'Failed to place order.'
          );
        }

        const result = responseBody as PlaceOrderResponse;
        const purchasedItems = cartItems
          .filter((item) => item.product?.id)
          .map((item) => ({
            productId: item.product!.id,
            quantity: item.quantity,
          }));

        dispatch(orderPaid(purchasedItems));
        setCheckoutInfo(
          `${result.message} Order ID: ${result.orderId}. Payment: ${result.paymentStatus}.`
        );
        setShowPaymentStep(false);
        setIsCheckoutOpen(false);
        setAddress(initialAddress);
        dispatch(loadCartCountRequest({ customerId: user.id }));
      } catch (error) {
        setCheckoutError(formatBackendError(error, 'checkout'));
      } finally {
        setIsPlacingOrder(false);
      }
    },
    [user?.id, address, dispatch]
  );

  const resetCheckout = () => {
    setIsCheckoutOpen(false);
    setShowPaymentStep(false);
    setAddress(initialAddress);
    setCheckoutError(null);
    setCheckoutInfo(null);
    setCouponCode('');
    setAppliedDiscount(0);
  };

  return {
    isCheckoutOpen,
    setIsCheckoutOpen,
    address,
    setAddress,
    showPaymentStep,
    setShowPaymentStep,
    checkoutError,
    setCheckoutError,
    checkoutInfo,
    setCheckoutInfo,
    isPlacingOrder,
    couponCode,
    setCouponCode,
    appliedDiscount,
    deliveryAddressRef,
    paymentConfirmationRef,
    handleAddressSubmit,
    applyCoupon,
    handlePlaceOrder,
    resetCheckout,
  };
}
