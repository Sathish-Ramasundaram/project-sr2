import { FormEvent, useState, useRef, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatBackendError } from '@/utils/apiError';
import { orderPaid } from '@/store/inventory/inventorySlice';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { graphqlRequest } from '@/api/graphqlClient';
import { APPLY_COUPON } from '@/api/operations';
import type {
  CartItemResponse,
  CheckoutStatusResponse,
  CheckoutAddress,
  PaymentDetails,
  PlaceOrderResponse,
  StartCheckoutResponse,
} from '@/pages/customer-cart/types';
import { initialAddress } from '@/pages/customer-cart/types';

const CHECKOUT_STORAGE_KEY = 'checkout_in_progress';
const CHECKOUT_MAX_WAIT_MS = 3 * 60 * 1000;
const CHECKOUT_MAX_TRANSIENT_FAILURES = 15;

type StoredCheckoutProgress = {
  workflowId: string;
  customerId: string;
  startedAt: number;
};

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
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponInfo, setCouponInfo] = useState<string | null>(null);
  const deliveryAddressRef = useRef<HTMLElement | null>(null);
  const paymentConfirmationRef = useRef<HTMLElement | null>(null);
  const isResumePollingActiveRef = useRef(false);
  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const saveCheckoutProgress = (progress: StoredCheckoutProgress) => {
    try {
      window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // localStorage can fail in private mode; continue without persistence.
    }
  };

  const loadCheckoutProgress = (): StoredCheckoutProgress | null => {
    try {
      const raw = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<StoredCheckoutProgress>;
      if (
        typeof parsed.workflowId === 'string' &&
        typeof parsed.customerId === 'string' &&
        typeof parsed.startedAt === 'number'
      ) {
        return {
          workflowId: parsed.workflowId,
          customerId: parsed.customerId,
          startedAt: parsed.startedAt,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const clearCheckoutProgress = () => {
    try {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failure.
    }
  };

  const finalizeCheckoutSuccess = useCallback(
    (result: PlaceOrderResponse, cartItems: CartItemResponse[]) => {
      const purchasedItems = cartItems
        .filter((item) => item.product?.id)
        .map((item) => ({
          productId: item.product!.id,
          quantity: item.quantity,
        }));

      if (purchasedItems.length > 0) {
        dispatch(orderPaid(purchasedItems));
      }
      setCheckoutInfo(
        `${result.message} Order ID: ${result.orderId}. Payment: ${result.paymentStatus}.`
      );
      setShowPaymentStep(false);
      setIsCheckoutOpen(false);
      setAddress(initialAddress);
      setCouponCode('');
      setAppliedDiscount(0);
      setCouponError(null);
      setCouponInfo(null);
      if (user?.id) {
        dispatch(loadCartCountRequest({ customerId: user.id }));
      }
      window.dispatchEvent(new Event('notifications-updated'));
      window.setTimeout(() => {
        window.dispatchEvent(new Event('notifications-updated'));
      }, 4000);
    },
    [dispatch, user?.id]
  );

  const pollCheckoutStatus = useCallback(
    async (workflowId: string, cartItems: CartItemResponse[]) => {
      const pollStartedAt = Date.now();
      let transientFailureCount = 0;

      while (Date.now() - pollStartedAt < CHECKOUT_MAX_WAIT_MS) {
        await wait(1000);

        let statusResponse: Response;
        try {
          statusResponse = await fetch(
            `http://localhost:5000/api/checkout/status/${workflowId}`
          );
        } catch {
          transientFailureCount += 1;
          if (transientFailureCount >= CHECKOUT_MAX_TRANSIENT_FAILURES) {
            throw new Error('Checkout status is temporarily unreachable.');
          }
          await wait(Math.min(5000, transientFailureCount * 500));
          continue;
        }

        let statusBody: CheckoutStatusResponse | { message?: string };
        try {
          statusBody = (await statusResponse.json()) as
            | CheckoutStatusResponse
            | { message?: string };
        } catch {
          transientFailureCount += 1;
          if (transientFailureCount >= CHECKOUT_MAX_TRANSIENT_FAILURES) {
            throw new Error('Checkout status response is invalid.');
          }
          continue;
        }

        if (!statusResponse.ok) {
          if (statusResponse.status >= 500) {
            transientFailureCount += 1;
            if (transientFailureCount >= CHECKOUT_MAX_TRANSIENT_FAILURES) {
              throw new Error('Checkout status is unavailable. Please try again.');
            }
            await wait(Math.min(5000, transientFailureCount * 500));
            continue;
          }

          throw new Error(
            'message' in statusBody && statusBody.message
              ? statusBody.message
              : 'Failed to fetch checkout status.'
          );
        }

        transientFailureCount = 0;

        if ('status' in statusBody && statusBody.status === 'RUNNING') {
          continue;
        }

        if ('status' in statusBody && statusBody.status === 'COMPLETED') {
          finalizeCheckoutSuccess(statusBody.result, cartItems);
          clearCheckoutProgress();
          return;
        }

        if ('status' in statusBody && statusBody.status === 'FAILED') {
          clearCheckoutProgress();
          throw new Error(statusBody.message ?? 'Payment failed.');
        }

        if (
          'status' in statusBody &&
          (statusBody.status === 'NOT_FOUND' || statusBody.status === 'ERROR')
        ) {
          transientFailureCount += 1;
          if (transientFailureCount >= CHECKOUT_MAX_TRANSIENT_FAILURES) {
            clearCheckoutProgress();
            throw new Error(statusBody.message ?? 'Unable to fetch checkout status.');
          }
        }
      }

      throw new Error('Payment is taking too long. Please check order status and retry.');
    },
    [finalizeCheckoutSuccess]
  );

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError(null);
    setCheckoutInfo(null);
    setShowPaymentStep(true);
  };

  const applyCoupon = useCallback(
    async (_cartTotal: number, customerId: string) => {
      if (!couponCode.trim()) {
        setCouponError('Please enter a coupon code');
        setCouponInfo(null);
        return false;
      }

      try {
        setCouponError(null);
        setCouponInfo(null);
        const result = (await graphqlRequest(APPLY_COUPON, {
          input: {
            customer_id: customerId,
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
          setCouponInfo(
            `Coupon applied. You saved \u20B9${result.apply_coupon.discount_amount}.`
          );
          return true;
        }

        setAppliedDiscount(0);
        setCouponError('Coupon not valid.');
        return false;
      } catch (error) {
        setAppliedDiscount(0);
        const message = formatBackendError(error, 'coupon application');
        if (message.toLowerCase().includes('invalid coupon')) {
          setCouponError('Coupon not valid.');
        } else {
          setCouponError(message);
        }
        return false;
      }
    },
    [couponCode]
  );

  const handlePlaceOrder = useCallback(
    async (cartItems: CartItemResponse[], _paymentDetails: PaymentDetails) => {
      if (!user?.id) {
        setCheckoutError('Customer not found for checkout.');
        return false;
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
          | StartCheckoutResponse
          | { message?: string };
        if (!response.ok) {
          throw new Error(
            'message' in responseBody && responseBody.message
              ? responseBody.message
              : 'Failed to place order.'
          );
        }

        const startResponse = responseBody as StartCheckoutResponse;
        saveCheckoutProgress({
          workflowId: startResponse.workflowId,
          customerId: user.id,
          startedAt: Date.now(),
        });
        await pollCheckoutStatus(startResponse.workflowId, cartItems);
        return true;
      } catch (error) {
        setCheckoutError(formatBackendError(error, 'checkout'));
        return false;
      } finally {
        setIsPlacingOrder(false);
      }
    },
    [user?.id, address, pollCheckoutStatus]
  );

  useEffect(() => {
    if (!user?.id || isResumePollingActiveRef.current) {
      return;
    }

    const progress = loadCheckoutProgress();
    if (!progress || progress.customerId !== user.id) {
      return;
    }

    isResumePollingActiveRef.current = true;
    setIsPlacingOrder(true);
    setCheckoutError(null);
    setCheckoutInfo('Resuming payment status...');
    setShowPaymentStep(true);

    void pollCheckoutStatus(progress.workflowId, [])
      .catch((error) => {
        setCheckoutError(formatBackendError(error, 'checkout'));
      })
      .finally(() => {
        setIsPlacingOrder(false);
        isResumePollingActiveRef.current = false;
      });
  }, [pollCheckoutStatus, user?.id]);

  const resetCheckout = () => {
    setIsCheckoutOpen(false);
    setShowPaymentStep(false);
    setAddress(initialAddress);
    setCheckoutError(null);
    setCheckoutInfo(null);
    setCouponCode('');
    setAppliedDiscount(0);
    setCouponError(null);
    setCouponInfo(null);
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
    couponError,
    couponInfo,
    deliveryAddressRef,
    paymentConfirmationRef,
    handleAddressSubmit,
    applyCoupon,
    handlePlaceOrder,
    resetCheckout,
  };
}
