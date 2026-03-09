import express from 'express';
import { createYoga } from 'graphql-yoga';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers';
import { graphqlSchema } from './graphql/schema';
import { requestLogger } from './middleware/requestLogger';
import adminProductsRouter from './routes/adminProducts';
import authRouter from './routes/auth';
import catalogueRouter from './routes/catalogue';
import checkoutRouter from './routes/checkout';
import couponsRouter from './routes/coupons';
import customerOrdersRouter from './routes/customerOrders';
import faqsRouter from './routes/faqs';
import healthRouter from './routes/health';
import 'dotenv/config';

const app = express();
const port = Number(process.env.PORT ?? 5000);
const yoga = createYoga({
  schema: graphqlSchema,
  graphqlEndpoint: '/graphql',
  graphiql: true,
});

app.use(express.json());
app.use(requestLogger);
app.use(corsMiddleware);
app.use('/graphql', yoga);

app.use('/api/catalogue', catalogueRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/faqs', faqsRouter);
app.use('/api/auth', authRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/customer/orders', customerOrdersRouter);
app.use('/api', healthRouter);
app.use('/', healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
