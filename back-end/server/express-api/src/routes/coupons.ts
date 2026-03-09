import express from 'express';
import { hasuraAdminRequest } from '../lib/hasuraClient';

const router = express.Router();

// Mock coupon data - replace with DB query
const coupons = {
  SAVE10: { discount: 10, type: 'percentage' },
  FLAT50: { discount: 50, type: 'fixed' },
};

type CartTotalResponse = {
  cart_items: Array<{
    quantity: number;
    product: {
      price: number;
      is_active: boolean;
    } | null;
  }>;
};

const GET_CART_TOTAL_BY_CUSTOMER = `
query GetCartTotalByCustomer($customerId: uuid!) {
  cart_items(where: { customer_id: { _eq: $customerId } }) {
    quantity
    product {
      price
      is_active
    }
  }
}
`;

router.post('/apply', async (req, res) => {
  try {
    // Hasura Actions send payload as req.body.input
    const actionInput =
      typeof req.body?.input?.input === 'object' && req.body.input.input
        ? req.body.input.input
        : typeof req.body?.input === 'object' && req.body.input
          ? req.body.input
          : req.body;
    const couponCode =
      typeof actionInput?.coupon_code === 'string'
        ? actionInput.coupon_code.trim()
        : '';
    // Backward-compatible: if client still sends cart_id, treat it as customer id for now.
    const customerIdRaw =
      typeof actionInput?.customer_id === 'string'
        ? actionInput.customer_id.trim()
        : typeof actionInput?.cart_id === 'string'
          ? actionInput.cart_id.trim()
          : '';

    if (!couponCode || !customerIdRaw) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: coupon_code and customer_id required',
      });
    }

    const coupon = coupons[couponCode.toUpperCase() as keyof typeof coupons];
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    const data = await hasuraAdminRequest<CartTotalResponse>(
      GET_CART_TOTAL_BY_CUSTOMER,
      {
        customerId: customerIdRaw,
      }
    );
    const cartTotal = data.cart_items.reduce((sum, item) => {
      const isActive = item.product?.is_active ?? false;
      if (!isActive) {
        return sum;
      }
      const price = Number(item.product?.price ?? 0);
      const quantity = Number(item.quantity ?? 0);
      return sum + price * quantity;
    }, 0);

    if (cartTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    let discount_amount = 0;
    let final_total = cartTotal;

    if (coupon.type === 'percentage') {
      discount_amount = cartTotal * (coupon.discount / 100);
      final_total = cartTotal - discount_amount;
    } else if (coupon.type === 'fixed') {
      discount_amount = coupon.discount;
      final_total = Math.max(0, cartTotal - discount_amount);
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discount_amount: Math.round(discount_amount * 100) / 100,
      final_total: Math.round(final_total * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
