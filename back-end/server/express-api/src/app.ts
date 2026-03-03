import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers";
import { requestLogger } from "./middleware/requestLogger";
import catalogueRouter from "./routes/catalogue";
import faqsRouter from "./routes/faqs";
import healthRouter from "./routes/health";
import productsRouter from "./routes/products";

const app = express();
const port = 5000;

app.use(express.json());
app.use(requestLogger);
app.use(corsMiddleware);

app.use("/api/catalogue", catalogueRouter);
app.use("/api/products", productsRouter);
app.use("/api/faqs", faqsRouter);
app.use("/api", healthRouter);
app.use("/", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
