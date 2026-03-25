import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { graphqlRequest } from "@/api/graphqlClient";
import { formatBackendError } from "@/utils/apiError";
import { emitCatalogueSync } from "@/utils/catalogueSync";
import type { ActionTarget, AdminProduct, NewProductForm } from "@/pages/admin-dashboard/types";
import { getAdminToken } from "@/store/admin/adminStorage";

const initialNewProductForm: NewProductForm = {
  name: "",
  description: "",
  imageUrl: ""
};

type FindProductByNameResponse = {
  products: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
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

type InsertProductResponse = {
  insert_products_one: {
    id: string;
  } | null;
};

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

const FIND_PRODUCT_BY_NAME = `
query FindProductByName($name: String!) {
  products(where: { name: { _ilike: $name } }, limit: 1) {
    id
    name
    is_active
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

const SET_PRODUCT_ACTIVE = `
mutation SetProductActive($productId: uuid!, $isActive: Boolean!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { is_active: $isActive }
  ) {
    affected_rows
    returning {
      id
      is_active
    }
  }
}
`;

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function useAdminProductEditor() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const [newProductForm, setNewProductForm] = useState<NewProductForm>(initialNewProductForm);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [unitInput, setUnitInput] = useState("");
  const [priceInput, setPriceInput] = useState("0");
  const [displayOrderInput, setDisplayOrderInput] = useState("1");
  const [reorderThresholdInput, setReorderThresholdInput] = useState("100");
  const [stockInput, setStockInput] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState("Essentials");

  const [isEditDirty, setIsEditDirty] = useState(false);
  const [actionInfo, setActionInfo] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [pendingReactivateProductId, setPendingReactivateProductId] = useState<string | null>(null);
  const [pendingReactivateName, setPendingReactivateName] = useState<string | null>(null);

  const graphqlAdminRequest = useCallback(
    async <T,>(query: string, variables: Record<string, unknown> = {}) => {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Admin session expired. Please log in again.");
      }
      return graphqlRequest<T>(query, variables, { authToken: token });
    },
    []
  );

  const applySelectionToForm = useCallback((nextProducts: AdminProduct[], productId: string) => {
    const selectedIndex = nextProducts.findIndex((item) => item.id === productId);
    if (selectedIndex === -1) {
      return false;
    }
    const selected = nextProducts[selectedIndex];

    setUnitInput(selected.quantity ?? "");
    setPriceInput(`${selected.price ?? 0}`);
    setDisplayOrderInput(`${selectedIndex + 1}`);
    setReorderThresholdInput(`${selected.reorderThreshold}`);
    setStockInput(`${selected.stock ?? 0}`);
    setSelectedCategory(selected.category ?? "Essentials");
    return true;
  }, []);

  const resetEditForm = useCallback(() => {
    setUnitInput("");
    setPriceInput("");
    setDisplayOrderInput("");
    setReorderThresholdInput("");
    setStockInput("");
    setSelectedCategory("Essentials");
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      setProductsError(null);
      setIsProductsLoading(true);
      const data = await graphqlAdminRequest<AdminProductsResponse>(GET_ACTIVE_PRODUCTS);
      const mapped = data.products.map((product) => ({
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
      setProducts(mapped);

      if (!selectedProductId) {
        if (!isEditDirty) {
          resetEditForm();
        }
        return;
      }

      const isSelectionPresent = mapped.some((item) => item.id === selectedProductId);
      if (!isSelectionPresent) {
        setSelectedProductId("");
        if (!isEditDirty) {
          resetEditForm();
        }
        return;
      }

      if (!isEditDirty) {
        applySelectionToForm(mapped, selectedProductId);
      }
    } catch (error) {
      setProducts([]);
      setProductsError(formatBackendError(error, "products"));
    } finally {
      setIsProductsLoading(false);
    }
  }, [applySelectionToForm, graphqlAdminRequest, isEditDirty, resetEditForm, selectedProductId]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    const refreshOnInterval = () => {
      if (!isEditDirty) {
        void refreshProducts();
      }
    };

    const intervalId = window.setInterval(refreshOnInterval, 10000);
    window.addEventListener("focus", refreshOnInterval);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnInterval);
    };
  }, [isEditDirty, refreshProducts]);

  const stockAlertItems = useMemo(
    () => products.filter((item) => item.stock <= item.reorderThreshold),
    [products]
  );

  const handleNewProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPendingReactivateProductId(null);
    setPendingReactivateName(null);
    try {
      setActionError(null);
      setActionInfo(null);
      setActionTarget("add");
      setIsActionLoading(true);

      const name = newProductForm.name.trim();
      if (!name) {
        throw new Error("Product name is required.");
      }

      const existing = await graphqlAdminRequest<FindProductByNameResponse>(FIND_PRODUCT_BY_NAME, {
        name
      });
      const existingProduct = existing.products[0];
      if (existingProduct) {
        if (!existingProduct.is_active) {
          setPendingReactivateProductId(existingProduct.id);
          setPendingReactivateName(existingProduct.name ?? name);
          return;
        }
        throw new Error(`"${existingProduct.name}" already exists.`);
      }

      const maxOrderResult = await graphqlAdminRequest<MaxDisplayOrderResponse>(
        GET_MAX_DISPLAY_ORDER
      );
      const nextDisplayOrder =
        (maxOrderResult.products_aggregate.aggregate?.max?.display_order ?? 0) + 1;

      const sku = `${slugify(name)}-${Date.now()}`;
      const productResult = await graphqlAdminRequest<InsertProductResponse>(INSERT_PRODUCT, {
        name,
        displayOrder: nextDisplayOrder,
        category: "Essentials",
        sku,
        unit: "",
        price: 0,
        description: newProductForm.description?.trim() || null,
        imageUrl: newProductForm.imageUrl?.trim() || null
      });

      const createdId = productResult.insert_products_one?.id;
      if (!createdId) {
        throw new Error("Product creation failed.");
      }

      await graphqlAdminRequest(INSERT_INVENTORY, {
        productId: createdId,
        stock: 0,
        reorderThreshold: 100
      });

      setActionInfo("Product added successfully.");
      setNewProductForm(initialNewProductForm);
      await refreshProducts();
    } catch (error) {
      setActionError(formatBackendError(error, "add product"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReactivate = async () => {
    if (!pendingReactivateProductId) return;
    try {
      setActionError(null);
      setActionInfo(null);
      setActionTarget("add");
      setIsActionLoading(true);

      await graphqlAdminRequest(SET_PRODUCT_ACTIVE, {
        productId: pendingReactivateProductId,
        isActive: true
      });

      setActionInfo("Product reactivated successfully.");
      setNewProductForm(initialNewProductForm);
      setPendingReactivateProductId(null);
      setPendingReactivateName(null);
      await refreshProducts();
      emitCatalogueSync();
    } catch (error) {
      setActionError(formatBackendError(error, "reactivate product"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelReactivate = () => {
    setPendingReactivateProductId(null);
    setPendingReactivateName(null);
  };

  const handleDeactivateProduct = async () => {
    if (!selectedProductId) return;
    try {
      setActionError(null);
      setActionInfo(null);
      setActionTarget("update");
      setIsActionLoading(true);

      await graphqlAdminRequest(SET_PRODUCT_ACTIVE, {
        productId: selectedProductId,
        isActive: false
      });

      setActionInfo("Product deactivated successfully.");
      setSelectedProductId("");
      setIsEditDirty(false);
      resetEditForm();
      await refreshProducts();
      emitCatalogueSync();
    } catch (error) {
      setActionError(formatBackendError(error, "deactivate product"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateItemDetails = async () => {
    if (!selectedProductId) {
      setActionTarget("update");
      setActionError("Select a product first.");
      return;
    }

    try {
      setActionError(null);
      setActionInfo(null);
      setActionTarget("update");
      setIsActionLoading(true);

      const nextDisplayOrder = Math.max(0, Number(displayOrderInput) - 1);
      const allProducts = await graphqlAdminRequest<AdminProductsResponse>(GET_ACTIVE_PRODUCTS);
      const productExists = allProducts.products.find((item) => item.id === selectedProductId);
      if (!productExists) {
        throw new Error("Product not found.");
      }

      const others = allProducts.products.filter((item) => item.id !== selectedProductId);
      const insertAt = Math.min(nextDisplayOrder, others.length);
      const reordered = [
        ...others.slice(0, insertAt),
        { id: selectedProductId, display_order: nextDisplayOrder },
        ...others.slice(insertAt)
      ];

      const displayOrderUpdates = reordered
        .map((item, index) => ({ id: item.id, newOrder: index }))
        .filter(({ id, newOrder }) => {
          const current = allProducts.products.find((product) => product.id === id);
          return current?.display_order !== newOrder;
        })
        .map(({ id, newOrder }) =>
          graphqlAdminRequest(UPDATE_PRODUCT_DISPLAY_ORDER, {
            productId: id,
            displayOrder: newOrder
          })
        );

      await Promise.all([
        graphqlAdminRequest(UPDATE_PRODUCT_CATEGORY, {
          productId: selectedProductId,
          category: selectedCategory
        }),
        graphqlAdminRequest(UPDATE_PRODUCT_UNIT, {
          productId: selectedProductId,
          unit: unitInput
        }),
        graphqlAdminRequest(UPDATE_PRODUCT_PRICE, {
          productId: selectedProductId,
          price: Number(priceInput)
        }),
        graphqlAdminRequest(SET_REORDER_THRESHOLD, {
          productId: selectedProductId,
          reorderThreshold: Number(reorderThresholdInput)
        }),
        graphqlAdminRequest(SET_STOCK, {
          productId: selectedProductId,
          stock: Number(stockInput)
        }),
        ...displayOrderUpdates
      ]);

      setIsEditDirty(false);
      await refreshProducts();
      emitCatalogueSync();
      setActionInfo("Item details updated successfully.");
    } catch (error) {
      setActionError(formatBackendError(error, "update item details"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNewProductFormChange = (field: keyof NewProductForm, value: string) => {
    setNewProductForm((current) => ({ ...current, [field]: value }));
  };

  const handleSelectedProductChange = (value: string) => {
    setSelectedProductId(value);
    setIsEditDirty(false);
    if (!value) {
      resetEditForm();
      return;
    }
    applySelectionToForm(products, value);
  };

  const markDirtyAndSetSelectedCategory = (value: string) => {
    setSelectedCategory(value);
    setIsEditDirty(true);
  };

  const markDirtyAndSetDisplayOrder = (value: string) => {
    setDisplayOrderInput(value);
    setIsEditDirty(true);
  };

  const markDirtyAndSetUnit = (value: string) => {
    setUnitInput(value);
    setIsEditDirty(true);
  };

  const markDirtyAndSetPrice = (value: string) => {
    setPriceInput(value);
    setIsEditDirty(true);
  };

  const markDirtyAndSetReorderThreshold = (value: string) => {
    setReorderThresholdInput(value);
    setIsEditDirty(true);
  };

  const markDirtyAndSetStock = (value: string) => {
    setStockInput(value);
    setIsEditDirty(true);
  };

  return {
    products,
    productsError,
    isProductsLoading,
    stockAlertItems,
    newProductForm,
    selectedProductId,
    selectedCategory,
    displayOrderInput,
    unitInput,
    priceInput,
    reorderThresholdInput,
    stockInput,
    isActionLoading,
    actionTarget,
    actionError,
    actionInfo,
    pendingReactivateName,
    handleNewProductSubmit,
    handleNewProductFormChange,
    handleSelectedProductChange,
    handleConfirmReactivate,
    handleCancelReactivate,
    handleDeactivateProduct,
    markDirtyAndSetSelectedCategory,
    markDirtyAndSetDisplayOrder,
    markDirtyAndSetUnit,
    markDirtyAndSetPrice,
    markDirtyAndSetReorderThreshold,
    markDirtyAndSetStock,
    handleUpdateItemDetails
  };
}
