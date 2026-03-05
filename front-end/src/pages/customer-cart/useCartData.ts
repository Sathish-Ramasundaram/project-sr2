import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { graphqlRequest } from '@/api/graphqlClient';
import {
  DELETE_CART_ITEM,
  GET_MY_CART,
  UPDATE_CART_ITEM_QUANTITY,
} from '@/api/operations';
import { formatBackendError } from '@/utils/apiError';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import type {
  CartItemResponse,
  GetMyCartResponse,
} from '@/pages/customer-cart/types';

export function useCartData() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCartItems = async () => {
    try {
      setCartError(null);
      setIsLoading(true);
      const data = await graphqlRequest<GetMyCartResponse>(GET_MY_CART);
      const filtered = data.cart_items.filter(
        (item) => item.product?.is_active
      );
      setCartItems(filtered);
    } catch (error) {
      setCartItems([]);
      setCartError(formatBackendError(error, 'cart items'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshCartItems();
  }, []);

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
        quantity: target.quantity + 1,
      });
      await refreshCartItems();
      dispatch(loadCartCountRequest({ customerId: user.id }));
    } catch (error) {
      setCartError(formatBackendError(error, 'cart update'));
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
          quantity: target.quantity - 1,
        });
      }
      await refreshCartItems();
      dispatch(loadCartCountRequest({ customerId: user.id }));
    } catch (error) {
      setCartError(formatBackendError(error, 'cart update'));
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
      setCartError(formatBackendError(error, 'cart update'));
    }
  };

  return {
    cartItems,
    cartError,
    isLoading,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveItem,
    refreshCartItems,
  };
}
