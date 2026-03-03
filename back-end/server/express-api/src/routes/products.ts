import { Router } from "express";
import { getProductCategory, products, sortProducts } from "../data/products";

const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  const categoryQuery =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const sortQuery = typeof req.query.sort === "string" ? req.query.sort : "default";

  let filteredProducts = [...products];

  if (categoryQuery && categoryQuery !== "All") {
    filteredProducts = filteredProducts.filter(
      (product) => getProductCategory(product.id).toLowerCase() === categoryQuery.toLowerCase()
    );
  }

  filteredProducts = sortProducts(filteredProducts, sortQuery, categoryQuery);

  res.json(
    filteredProducts.map((product) => ({
      ...product,
      category: getProductCategory(product.id)
    }))
  );
});

productsRouter.get("/:id", (req, res) => {
  const productId = req.params.id;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.json(product);
});

export default productsRouter;
