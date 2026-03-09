import { Request, Response } from 'express';
import { getCustomerOrders } from './customerOrdersService';

export async function getCustomerOrdersHandler(req: Request, res: Response) {
  const customerId =
    typeof req.query.customerId === 'string' ? req.query.customerId.trim() : '';

  if (!customerId) {
    res.status(400).json({ message: 'customerId is required.' });
    return;
  }

  try {
    const orders = await getCustomerOrders(customerId);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : 'Failed to load customer orders.',
    });
  }
}
