import { hasuraAdminRequest } from "../../lib/hasuraClient";
import { slugify } from "./adminProductsValidation";

type AdminProductsResponse = {
  products: Array<{
    id: string;
    name: string;
    display_order: number | null;
    category: string | null;
    image_url: string;
    unit: string;
    price: number;
    description: string | null;
    is_active: boolean;
    inventory: {
      stock: number;
      reorder_threshold: number;
    } | null;
  }>;
};

type SalesSummaryRow = {
  quantity: number;
  unit_price: number;
  product: {
    id: string;
    name: string;
  } | null;
};

type SalesSummaryResponse = {
  order_items: SalesSummaryRow[];
};

type InsertProductResponse = {
  insert_products_one: {
    id: string;
  } | null;
};

type MaxDisplayOrderResponse = {
  products_aggregate: {
    aggregate: {
      max: {
        display_order: number | null;
      } | null;
    } | null;
  };
};

type UpdateInventoryThresholdResponse = {
  update_inventory: {
    affected_rows: number;
    returning: Array<{ reorder_threshold: number }>;
  };
};

type UpdateProductUnitResponse = {
  update_products: {
    affected_rows: number;
    returning: Array<{ id: string; unit: string | null }>;
  };
};

type UpdateProductPriceResponse = {
  update_products: {
    affected_rows: number;
    returning: Array<{ id: string; price: number | null }>;
  };
};

type UpdateProductDisplayOrderResponse = {
  update_products: {
    affected_rows: number;
    returning: Array<{ id: string; display_order: number | null }>;
  };
};

type UpdateInventoryStockResponse = {
  update_inventory: {
    affected_rows: number;
    returning: Array<{ stock: number }>;
  };
};

type UpdateProductCategoryResponse = {
  update_products: {
    affected_rows: number;
    returning: Array<{ id: string; category: string | null }>;
  };
};

const GET_ACTIVE_PRODUCTS = `
query GetActiveProductsForAdmin {
  products(
    where: { is_active: { _eq: true } }
    order_by: [{ display_order: asc_nulls_last }, { name: asc }]
  ) {
    id
    name
    display_order
    category
    image_url
    unit
    price
    description
    is_active
    inventory {
      stock
      reorder_threshold
    }
  }
}
`;

const GET_MAX_DISPLAY_ORDER = `
query GetMaxDisplayOrder {
  products_aggregate(where: { is_active: { _eq: true } }) {
    aggregate {
      max {
        display_order
      }
    }
  }
}
`;

const INSERT_PRODUCT = `
mutation InsertProduct(
  $name: String!
  $displayOrder: Int!
  $category: String!
  $sku: String!
  $unit: String!
  $price: numeric!
  $description: String
  $imageUrl: String
) {
  insert_products_one(
    object: {
      name: $name
      display_order: $displayOrder
      category: $category
      sku: $sku
      unit: $unit
      price: $price
      description: $description
      image_url: $imageUrl
      is_active: true
    }
  ) {
    id
  }
}
`;

const INSERT_INVENTORY = `
mutation InsertInventory(
  $productId: uuid!
  $stock: Int!
  $reorderThreshold: Int!
) {
  insert_inventory_one(
    object: {
      product_id: $productId
      stock: $stock
      reorder_threshold: $reorderThreshold
    }
  ) {
    id
  }
}
`;

const SET_REORDER_THRESHOLD = `
mutation SetReorderThreshold($productId: uuid!, $reorderThreshold: Int!) {
  update_inventory(
    where: { product_id: { _eq: $productId } }
    _set: { reorder_threshold: $reorderThreshold }
  ) {
    affected_rows
    returning {
      reorder_threshold
    }
  }
}
`;

const UPDATE_PRODUCT_CATEGORY = `
mutation UpdateProductCategory($productId: uuid!, $category: String!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { category: $category }
  ) {
    affected_rows
    returning {
      id
      category
    }
  }
}
`;

const UPDATE_PRODUCT_UNIT = `
mutation UpdateProductUnit($productId: uuid!, $unit: String!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { unit: $unit }
  ) {
    affected_rows
    returning {
      id
      unit
    }
  }
}
`;

const UPDATE_PRODUCT_PRICE = `
mutation UpdateProductPrice($productId: uuid!, $price: numeric!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { price: $price }
  ) {
    affected_rows
    returning {
      id
      price
    }
  }
}
`;

const UPDATE_PRODUCT_DISPLAY_ORDER = `
mutation UpdateProductDisplayOrder($productId: uuid!, $displayOrder: Int!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { display_order: $displayOrder }
  ) {
    affected_rows
    returning {
      id
      display_order
    }
  }
}
`;

const SET_STOCK = `
mutation SetStock($productId: uuid!, $stock: Int!) {
  update_inventory(
    where: { product_id: { _eq: $productId } }
    _set: { stock: $stock }
  ) {
    affected_rows
    returning {
      stock
    }
  }
}
`;

const GET_SALES_SUMMARY = `
query GetSalesSummary($from: timestamptz!, $to: timestamptz!) {
  order_items(
    where: {
      order: {
        status: { _eq: "paid" }
        placed_at: { _gte: $from, _lte: $to }
      }
    }
  ) {
    quantity
    unit_price
    product {
      id
      name
    }
  }
}
`;

export async function getAdminProducts() {
  const data = await hasuraAdminRequest<AdminProductsResponse>(GET_ACTIVE_PRODUCTS);
  return data.products.map((product) => ({
    id: product.id,
    name: product.name,
    displayOrder: product.display_order ?? 1,
    category: product.category ?? "Essentials",
    imageUrl: product.image_url ?? "",
    quantity: product.unit,
    price: Number(product.price),
    description: product.description ?? "",
    stock: product.inventory?.stock ?? 0,
    reorderThreshold: product.inventory?.reorder_threshold ?? 0
  }));
}

export async function getSalesSummary(fromIso: string, toIso: string) {
  const data = await hasuraAdminRequest<SalesSummaryResponse>(GET_SALES_SUMMARY, {
    from: fromIso,
    to: toIso
  });

  const productMap = new Map<
    string,
    {
      productId: string;
      name: string;
      units: number;
      value: number;
    }
  >();

  for (const row of data.order_items) {
    const productId = row.product?.id;
    const name = row.product?.name ?? "Unknown product";
    const quantity = Number(row.quantity ?? 0);
    const unitPrice = Number(row.unit_price ?? 0);

    if (!productId || quantity <= 0) {
      continue;
    }

    const existing = productMap.get(productId);
    if (existing) {
      existing.units += quantity;
      existing.value += quantity * unitPrice;
      continue;
    }

    productMap.set(productId, {
      productId,
      name,
      units: quantity,
      value: quantity * unitPrice
    });
  }

  const items = Array.from(productMap.values()).sort((left, right) => right.value - left.value);
  const totalRevenue = items.reduce((sum, item) => sum + item.value, 0);
  return { totalRevenue, items };
}

export async function createProduct(input: {
  name: string;
  description?: string;
  imageUrl?: string;
}) {
  const maxOrderResult = await hasuraAdminRequest<MaxDisplayOrderResponse>(GET_MAX_DISPLAY_ORDER);
  const nextDisplayOrder = (maxOrderResult.products_aggregate.aggregate?.max?.display_order ?? 0) + 1;

  const sku = `${slugify(input.name)}-${Date.now()}`;
  const productResult = await hasuraAdminRequest<InsertProductResponse>(INSERT_PRODUCT, {
    name: input.name.trim(),
    displayOrder: nextDisplayOrder,
    category: "Essentials",
    sku,
    unit: "1 unit",
    price: 0,
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null
  });

  const createdId = productResult.insert_products_one?.id;
  if (!createdId) {
    throw new Error("Product creation failed.");
  }

  await hasuraAdminRequest(INSERT_INVENTORY, {
    productId: createdId,
    stock: 0,
    reorderThreshold: 100
  });
}

export async function updateReorderThreshold(productId: string, reorderThreshold: number) {
  const result = await hasuraAdminRequest<UpdateInventoryThresholdResponse>(SET_REORDER_THRESHOLD, {
    productId,
    reorderThreshold
  });

  if (result.update_inventory.affected_rows === 0) {
    return null;
  }

  return result.update_inventory.returning[0]?.reorder_threshold ?? null;
}

export async function updateUnit(productId: string, unit: string) {
  const result = await hasuraAdminRequest<UpdateProductUnitResponse>(UPDATE_PRODUCT_UNIT, {
    productId,
    unit
  });

  if (result.update_products.affected_rows === 0) {
    return null;
  }

  return result.update_products.returning[0]?.unit ?? null;
}

export async function updatePrice(productId: string, price: number) {
  const result = await hasuraAdminRequest<UpdateProductPriceResponse>(UPDATE_PRODUCT_PRICE, {
    productId,
    price
  });

  if (result.update_products.affected_rows === 0) {
    return null;
  }

  return result.update_products.returning[0]?.price ?? null;
}

export async function updateDisplayOrder(productId: string, displayOrder: number) {
  const result = await hasuraAdminRequest<UpdateProductDisplayOrderResponse>(
    UPDATE_PRODUCT_DISPLAY_ORDER,
    {
      productId,
      displayOrder
    }
  );

  if (result.update_products.affected_rows === 0) {
    return null;
  }

  return result.update_products.returning[0]?.display_order ?? null;
}

export async function updateStock(productId: string, stock: number) {
  const result = await hasuraAdminRequest<UpdateInventoryStockResponse>(SET_STOCK, {
    productId,
    stock
  });

  if (result.update_inventory.affected_rows === 0) {
    return null;
  }

  return result.update_inventory.returning[0]?.stock ?? null;
}

export async function updateCategory(productId: string, category: string) {
  const result = await hasuraAdminRequest<UpdateProductCategoryResponse>(UPDATE_PRODUCT_CATEGORY, {
    productId,
    category
  });

  if (result.update_products.affected_rows === 0) {
    return null;
  }

  return result.update_products.returning[0]?.category ?? null;
}
