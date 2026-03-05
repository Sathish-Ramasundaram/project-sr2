import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { graphqlRequest } from "@/api/graphqlClient";
import { DELETE_CART_ITEM, GET_MY_CART, UPDATE_CART_ITEM_QUANTITY } from "@/api/operations";
import { logout } from "@/store/auth/authSlice";
import { loadCartCountRequest } from "@/store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { orderPaid } from "@/store/inventory/inventorySlice";
import { formatBackendError } from "@/utils/apiError";
import {
  type CheckoutAddress,
  type GetMyCartResponse,
  initialAddress,
  type PlaceOrderResponse
} from "./types";

export function useCustomerCartFlow() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) => state.cart.count);

  const [cartItems, setCartItems] = useState<GetMyCartResponse["cart_items"]>([]);
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

  const openCheckout = () => setIsCheckoutOpen(true);

  const updateAddressField = (field: keyof CheckoutAddress, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
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

  return {
    user,
    cartCount,
    cartItems,
    cartError,
    isLoading,
    isCheckoutOpen,
    address,
    showPaymentStep,
    checkoutError,
    checkoutInfo,
    isPlacingOrder,
    totalAmount,
    handleLogout,
    openCheckout,
    updateAddressField,
    handleAddressSubmit,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveItem,
    handlePlaceOrder
  };
}
