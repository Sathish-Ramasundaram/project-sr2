import { Router } from "express";
import { studentItems } from "../data/catalogue";
import { hasuraAdminRequest } from "../lib/hasuraClient";

const catalogueRouter = Router();

type CatalogueProductsResponse = {
  products: Array<{
    id: string;
    name: string;
    display_order: number | null;
    unit: string;
    price: number;
    description: string | null;
    image_url: string | null;
    category: string | null;
    is_active: boolean;
    inventory: {
      stock: number;
      reorder_threshold: number;
    } | null;
  }>;
};

const GET_CATALOGUE_PRODUCTS = `
query GetCatalogueProducts {
  products(
    where: { is_active: { _eq: true } }
    order_by: [{ display_order: asc_nulls_last }, { name: asc }]
  ) {
    id
    name
    display_order
    unit
    price
    description
    image_url
    category
    is_active
    inventory {
      stock
      reorder_threshold
    }
  }
}
`;

catalogueRouter.get("/students", (_req, res) => {
  res.json(studentItems);
});

catalogueRouter.get("/products", async (req, res) => {
  const categoryQuery =
    typeof req.query.category === "string" ? req.query.category.trim() : "All";
  const sortQuery =
    typeof req.query.sort === "string" ? req.query.sort.trim() : "default";

  try {
    const data = await hasuraAdminRequest<CatalogueProductsResponse>(GET_CATALOGUE_PRODUCTS);

    let items = data.products
      .filter((item) => item.is_active)
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.unit,
        price: Number(item.price),
        displayOrder: item.display_order ?? 1,
        category: item.category ?? "Essentials",
        description: item.description ?? "",
        imageUrl: item.image_url ?? "",
        stock: item.inventory?.stock ?? 0,
        reorderThreshold: item.inventory?.reorder_threshold ?? 0
      }));

    if (categoryQuery && categoryQuery !== "All") {
      items = items.filter(
        (item) => item.category.toLowerCase() === categoryQuery.toLowerCase()
      );
    }

    if (sortQuery === "low-to-high") {
      items = [...items].sort((left, right) => left.price - right.price);
    } else if (sortQuery === "high-to-low") {
      items = [...items].sort((left, right) => right.price - left.price);
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to load catalogue products"
    });
  }
});

export default catalogueRouter;
