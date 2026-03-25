import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { formatBackendError } from "@/utils/apiError";
import { emitCatalogueSync } from "@/utils/catalogueSync";
import type { ActionTarget, AdminProduct, NewProductForm } from "@/pages/admin-dashboard/types";
import { getAdminToken } from "@/store/admin/adminStorage";

const initialNewProductForm: NewProductForm = {
  name: "",
  description: "",
  imageUrl: ""
};

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

  const getAuthHeaders = useCallback(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

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
      const response = await fetch("http://localhost:5000/api/admin/products", {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = (await response.json()) as AdminProduct[];
      setProducts(data);

      if (!selectedProductId) {
        if (!isEditDirty) {
          resetEditForm();
        }
        return;
      }

      const isSelectionPresent = data.some((item) => item.id === selectedProductId);
      if (!isSelectionPresent) {
        setSelectedProductId("");
        if (!isEditDirty) {
          resetEditForm();
        }
        return;
      }

      if (!isEditDirty) {
        applySelectionToForm(data, selectedProductId);
      }
    } catch (error) {
      setProducts([]);
      setProductsError(formatBackendError(error, "products"));
    } finally {
      setIsProductsLoading(false);
    }
  }, [applySelectionToForm, getAuthHeaders, isEditDirty, resetEditForm, selectedProductId]);

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

      const response = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: newProductForm.name,
          description: newProductForm.description,
          imageUrl: newProductForm.imageUrl
        })
      });

      const body = (await response.json()) as { message?: string; code?: string; productId?: string; name?: string };

      if (response.status === 409 && body.code === "PRODUCT_DEACTIVATED" && body.productId) {
        setPendingReactivateProductId(body.productId);
        setPendingReactivateName(body.name ?? newProductForm.name);
        return;
      }

      if (!response.ok) {
        throw new Error(body.message ?? "Failed to add product");
      }

      setActionInfo(body.message ?? "Product added successfully.");
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

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${pendingReactivateProductId}/active`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ isActive: true })
        }
      );

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to reactivate product");
      }

      setActionInfo(body.message ?? "Product reactivated successfully.");
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

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProductId}/active`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ isActive: false })
        }
      );

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to deactivate product");
      }

      setActionInfo(body.message ?? "Product deactivated successfully.");
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

      const requests = [
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/category`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ category: selectedCategory })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/display-order`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ displayOrder: Math.max(0, Number(displayOrderInput) - 1) })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/unit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ unit: unitInput })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/price`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ price: Number(priceInput) })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/reorder-threshold`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ reorderThreshold: Number(reorderThresholdInput) })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ stock: Number(stockInput) })
        })
      ];

      const responses = await Promise.all(requests);
      for (const response of responses) {
        const body = (await response.json()) as { message?: string };
        if (!response.ok) {
          throw new Error(body.message ?? "Failed to update item details");
        }
      }

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
