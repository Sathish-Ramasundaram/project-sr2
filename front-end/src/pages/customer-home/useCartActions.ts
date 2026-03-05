import { useEffect, useState } from 'react';
import { graphqlRequest } from '@/api/graphqlClient';
import {
  DELETE_CART_ITEM,
  GET_CART_ITEM_QUANTITY,
  GET_MY_CART,
  INSERT_CART_ITEM,
  UPDATE_CART_ITEM_QUANTITY,
} from '@/api/operations';
import { formatBackendError } from '@/utils/apiError';
import { loadCartCountRequest } from '@/store/cart/cartSlice';
import { useAppDispatch } from '@/store/hooks';

type CartItem = {
  cartItemId: string;
  quantity: number;
};

type CartByProductId = Record<string, CartItem>;

type InlineCartFeedback = {
  productId: string;
  text: string;
  tone: 'success' | 'error';
} | null;

export function useCartActions(userId: string | undefined) {
  const dispatch = useAppDispatch();
  const [cartByProductId, setCartByProductId] = useState<CartByProductId>({});
  const [cartLoadingProductId, setCartLoadingProductId] = useState<
    string | null
  >(null);
  const [inlineCartFeedback, setInlineCartFeedback] =
    useState<InlineCartFeedback>(null);

  useEffect(() => {
    const loadMyCartProducts = async () => {
      if (!userId) {
        setCartByProductId({});
        return;
      }

      try {
        const data = await graphqlRequest<{
          cart_items: Array<{
            id: string;
            customer_id: string;
            quantity: number;
            product: { id: string; is_active: boolean } | null;
          }>;
        }>(GET_MY_CART);
        const map: CartByProductId = {};
        data.cart_items
          .filter(
            (item) => item.customer_id === userId && item.product?.is_active
          )
          .forEach((item) => {
            if (!item.product) return;
            const existing = map[item.product.id];
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              map[item.product.id] = {
                cartItemId: item.id,
                quantity: item.quantity,
              };
            }
          });
        setCartByProductId(map);
      } catch {
        setCartByProductId({});
      }
    };

    void loadMyCartProducts();
  }, [userId]);

  const handleAddToCart = async (productId: string, stock: number) => {
    const liveStock = stock;
    const currentQuantity = cartByProductId[productId]?.quantity ?? 0;
    if (liveStock <= 0 || currentQuantity >= liveStock) {
      setInlineCartFeedback({
        productId,
        text: 'Item is out of stock in godown.',
        tone: 'error',
      });
      return;
    }

    if (!userId) {
      setInlineCartFeedback({
        productId,
        text: 'Customer not found for cart update.',
        tone: 'error',
      });
      return;
    }

    try {
      setCartLoadingProductId(productId);
      setInlineCartFeedback(null);

      const cartItemData = await graphqlRequest<{
        cart_items: Array<{ id: string; quantity: number }>;
      }>(GET_CART_ITEM_QUANTITY, { customerId: userId, productId });

      const existing = cartItemData.cart_items[0];
      if (!existing) {
        await graphqlRequest(INSERT_CART_ITEM, {
          customerId: userId,
          productId,
          quantity: 1,
        });
      } else {
        await graphqlRequest(UPDATE_CART_ITEM_QUANTITY, {
          customerId: userId,
          productId,
          quantity: existing.quantity + 1,
        });
      }

      dispatch(loadCartCountRequest({ customerId: userId }));
    } catch (error) {
      const message = formatBackendError(error, 'cart update');
      if (message.toLowerCase().includes('out of stock')) {
        setInlineCartFeedback({
          productId,
          text: 'Item is out of stock in godown.',
          tone: 'error',
        });
      }
    } finally {
      setCartLoadingProductId(null);
    }
  };

  const handleDecreaseCart = async (productId: string) => {
    if (!userId) return;
    const existing = cartByProductId[productId];
    if (!existing) return;

    try {
      setCartLoadingProductId(productId);
      setInlineCartFeedback(null);
      if (existing.quantity <= 1) {
        await graphqlRequest(DELETE_CART_ITEM, {
          cartItemId: existing.cartItemId,
        });
      } else {
        await graphqlRequest(UPDATE_CART_ITEM_QUANTITY, {
          customerId: userId,
          productId,
          quantity: existing.quantity - 1,
        });
      }
      dispatch(loadCartCountRequest({ customerId: userId }));
    } finally {
      setCartLoadingProductId(null);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    if (!userId) return;
    const existing = cartByProductId[productId];
    if (!existing) return;

    try {
      setCartLoadingProductId(productId);
      setInlineCartFeedback(null);
      await graphqlRequest(DELETE_CART_ITEM, {
        cartItemId: existing.cartItemId,
      });
      dispatch(loadCartCountRequest({ customerId: userId }));
    } finally {
      setCartLoadingProductId(null);
    }
  };

  return {
    cartByProductId,
    cartLoadingProductId,
    inlineCartFeedback,
    handleAddToCart,
    handleDecreaseCart,
    handleRemoveFromCart,
  };
}
