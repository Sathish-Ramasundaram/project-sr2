import express from 'express';

const router = express.Router();

// Mock coupon data - replace with DB query
const coupons = {
  SAVE10: { discount: 10, type: 'percentage' },
  FLAT50: { discount: 50, type: 'fixed' },
};

router.post('/apply', (req, res) => {
  try {
    // Hasura Actions wrap the input in an "input" field
    const { input } = req.body;
    const { coupon_code, cart_id } = input?.input || {};

    if (!coupon_code || !cart_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: coupon_code and cart_id required',
      });
    }

    const coupon = coupons[coupon_code.toUpperCase() as keyof typeof coupons];
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // For now, use a mock cart total. In production, query from DB using cart_id
    const cart_total = 100; // Mock value
    let discount_amount = 0;
    let final_total = cart_total;

    if (coupon.type === 'percentage') {
      discount_amount = cart_total * (coupon.discount / 100);
      final_total = cart_total - discount_amount;
    } else if (coupon.type === 'fixed') {
      discount_amount = coupon.discount;
      final_total = Math.max(0, cart_total - discount_amount);
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
