import { Router } from 'express';
import { getCustomerOrdersHandler } from '../modules/customerOrders/customerOrdersController';

const customerOrdersRouter = Router();

customerOrdersRouter.get('/', getCustomerOrdersHandler);

export default customerOrdersRouter;
