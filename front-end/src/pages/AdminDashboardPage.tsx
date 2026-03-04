import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { formatBackendError } from "../utils/apiError";
import { emitCatalogueSync } from "../utils/catalogueSync";
import { adminLogout } from "../store/admin/adminSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { hydrateInventoryItems } from "../store/inventory/inventorySlice";
import { loadInventoryState } from "../store/inventory/inventoryStorage";

type SalesFilter = "last30" | "custom";

type AdminProduct = {
  id: string;
  name: string;
  displayOrder: number;
  category: string;
  quantity: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  reorderThreshold: number;
};

type NewProductForm = {
  name: string;
  description: string;
  imageUrl: string;
};

const initialNewProductForm: NewProductForm = {
  name: "",
  description: "",
  imageUrl: ""
};

const startOfDay = (value: Date): Date => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value: Date): Date => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const toInputDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const inventoryItems = useAppSelector((state) => state.inventory.items);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [salesFilter, setSalesFilter] = useState<SalesFilter>("last30");
  const [fromDate, setFromDate] = useState<string>(() =>
    toInputDate(startOfDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)))
  );
  const [toDate, setToDate] = useState<string>(() => toInputDate(new Date()));
  const [newProductForm, setNewProductForm] = useState<NewProductForm>(initialNewProductForm);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [unitInput, setUnitInput] = useState("");
  const [priceInput, setPriceInput] = useState("0");
  const [displayOrderInput, setDisplayOrderInput] = useState("1");
  const [reorderThresholdInput, setReorderThresholdInput] = useState("100");
  const [stockInput, setStockInput] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState("Essentials");
  const [actionInfo, setActionInfo] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<"add" | "update" | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const refreshProducts = async () => {
    try {
      setProductsError(null);
      setIsProductsLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/products");
      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = (await response.json()) as AdminProduct[];
      setProducts(data);
      if (selectedProductId) {
        const selected = data.find((item) => item.id === selectedProductId);
        if (selected) {
          setUnitInput(selected.quantity ?? "");
          setPriceInput(`${selected.price ?? 0}`);
          setDisplayOrderInput(`${selected.displayOrder ?? 1}`);
          setReorderThresholdInput(`${selected.reorderThreshold}`);
          setStockInput(`${selected.stock ?? 0}`);
          setSelectedCategory(selected.category ?? "Essentials");
        } else {
          setSelectedProductId("");
          setUnitInput("");
          setPriceInput("");
          setDisplayOrderInput("");
          setReorderThresholdInput("");
          setStockInput("");
          setSelectedCategory("Essentials");
        }
      } else {
        setUnitInput("");
        setPriceInput("");
        setDisplayOrderInput("");
        setReorderThresholdInput("");
        setStockInput("");
        setSelectedCategory("Essentials");
      }
    } catch (error) {
      setProducts([]);
      setProductsError(formatBackendError(error, "products"));
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(hydrateInventoryItems(loadInventoryState().items));
  }, [dispatch]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "sr_store_inventory") {
        return;
      }
      dispatch(hydrateInventoryItems(loadInventoryState().items));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  useEffect(() => {
    void refreshProducts();
  }, []);

  const inventoryMap = useMemo(() => {
    const result = new Map<string, { sold: number; salesHistory: number[] }>();
    inventoryItems.forEach((item) => {
      result.set(item.productId, {
        sold: item.sold,
        salesHistory: Array.isArray((item as { salesHistory?: unknown }).salesHistory)
          ? ((item as { salesHistory: unknown[] }).salesHistory.filter(
              (entry): entry is number => typeof entry === "number"
            ))
          : []
      });
    });
    return result;
  }, [inventoryItems]);

  const now = new Date();
  let filterStart = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
  let filterEnd = endOfDay(now);

  if (salesFilter === "custom") {
    if (fromDate) {
      filterStart = startOfDay(new Date(fromDate));
    }
    if (toDate) {
      filterEnd = endOfDay(new Date(toDate));
    }
  }

  const rangeStartMs = filterStart.getTime();
  const rangeEndMs = filterEnd.getTime();

  const salesByProduct = products
    .map((product) => {
      const salesHistory = inventoryMap.get(product.id)?.salesHistory ?? [];
      const units = salesHistory.filter(
        (timestamp) => timestamp >= rangeStartMs && timestamp <= rangeEndMs
      ).length;

      return {
        productId: product.id,
        name: product.name,
        units,
        value: units * product.price
      };
    })
    .filter((entry) => entry.units > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);

  const soldAmount = salesByProduct.reduce((sum, entry) => sum + entry.value, 0);
  const maxSalesValue = Math.max(...salesByProduct.map((entry) => entry.value), 0);

  const stockAlertItems = products.filter((item) => item.stock <= item.reorderThreshold);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login");
  };

  const handleNewProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setActionError(null);
      setActionInfo(null);
      setActionTarget("add");
      setIsActionLoading(true);

      const response = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newProductForm.name,
          description: newProductForm.description,
          imageUrl: newProductForm.imageUrl
        })
      });

      const body = (await response.json()) as { message?: string };
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

  const handleSetUnit = async () => {
    if (!selectedProductId) {
      setActionError("Select a product first.");
      return;
    }

    try {
      setActionError(null);
      setActionInfo(null);
      setActionTarget("update");
      setIsActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProductId}/unit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            unit: unitInput
          })
        }
      );

      const body = (await response.json()) as {
        message?: string;
        unit?: string | null;
      };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to set unit");
      }

      setActionInfo(
        body.unit ? `${body.message ?? "Unit updated."} New unit: ${body.unit}` : body.message ?? "Unit updated."
      );
      await refreshProducts();
    } catch (error) {
      setActionError(formatBackendError(error, "set unit"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetPrice = async () => {
    if (!selectedProductId) {
      setActionError("Select a product first.");
      return;
    }

    try {
      setActionError(null);
      setActionInfo(null);
      setIsActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProductId}/price`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            price: Number(priceInput)
          })
        }
      );

      const body = (await response.json()) as {
        message?: string;
        price?: number | null;
      };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to set price");
      }

      setActionInfo(
        body.price !== undefined && body.price !== null
          ? `${body.message ?? "Price updated."} New price: ${body.price}`
          : body.message ?? "Price updated."
      );
      await refreshProducts();
    } catch (error) {
      setActionError(formatBackendError(error, "set price"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetReorderLevel = async () => {
    if (!selectedProductId) {
      setActionError("Select a product first.");
      return;
    }

    try {
      setActionError(null);
      setActionInfo(null);
      setIsActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProductId}/reorder-threshold`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            reorderThreshold: Number(reorderThresholdInput)
          })
        }
      );

      const body = (await response.json()) as {
        message?: string;
        reorderThreshold?: number | null;
      };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to set reorder level");
      }

      setActionInfo(
        body.reorderThreshold !== undefined && body.reorderThreshold !== null
          ? `${body.message ?? "Reorder level updated."} New level: ${body.reorderThreshold}`
          : body.message ?? "Reorder level updated."
      );
      await refreshProducts();
    } catch (error) {
      setActionError(formatBackendError(error, "set reorder level"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetDisplayOrder = async () => {
    if (!selectedProductId) {
      setActionError("Select a product first.");
      return;
    }

    try {
      setActionError(null);
      setActionInfo(null);
      setIsActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProductId}/display-order`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            displayOrder: Number(displayOrderInput)
          })
        }
      );

      const body = (await response.json()) as {
        message?: string;
        displayOrder?: number | null;
      };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to set display order");
      }

      setActionInfo(
        body.displayOrder !== undefined && body.displayOrder !== null
          ? `${body.message ?? "Display order updated."} New order: ${body.displayOrder}`
          : body.message ?? "Display order updated."
      );
      await refreshProducts();
    } catch (error) {
      setActionError(formatBackendError(error, "set display order"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedProductId) {
      setActionError("Select a product first.");
      return;
    }

    try {
      setActionError(null);
      setActionInfo(null);
      setIsActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProductId}/category`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            category: selectedCategory
          })
        }
      );

      const body = (await response.json()) as {
        message?: string;
        category?: string | null;
      };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to update category");
      }

      setActionInfo(
        body.category ? `${body.message ?? "Category updated."} New category: ${body.category}` : body.message ?? "Category updated."
      );
      await refreshProducts();
    } catch (error) {
      setActionError(formatBackendError(error, "update category"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetStock = async () => {
    if (!selectedProductId) {
      setActionError("Select a product first.");
      return;
    }

    try {
      setActionError(null);
      setActionInfo(null);
      setIsActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/products/${selectedProductId}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            stock: Number(stockInput)
          })
        }
      );

      const body = (await response.json()) as {
        message?: string;
        stock?: number | null;
      };
      if (!response.ok) {
        throw new Error(body.message ?? "Failed to update stock");
      }

      setActionInfo(
        body.stock !== undefined && body.stock !== null
          ? `${body.message ?? "Stock updated."} New stock: ${body.stock}`
          : body.message ?? "Stock updated."
      );
      await refreshProducts();
    } catch (error) {
      setActionError(formatBackendError(error, "update stock"));
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: selectedCategory })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/display-order`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: Number(displayOrderInput) })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/unit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unit: unitInput })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/price`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: Number(priceInput) })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/reorder-threshold`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reorderThreshold: Number(reorderThresholdInput) })
        }),
        fetch(`http://localhost:5000/api/admin/products/${selectedProductId}/stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
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

      await refreshProducts();
      emitCatalogueSync();
      setActionInfo("Item details updated successfully.");
    } catch (error) {
      setActionError(formatBackendError(error, "update item details"));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={(
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
        )}
        right={(
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Logout
            </button>
          </div>
        )}
      />

      <main className="w-full px-6 py-8">
        <div className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>
        {productsError ? (
          <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{productsError}</p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Sales Graph (Top Products)</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={salesFilter}
                  onChange={(event) => setSalesFilter(event.target.value as SalesFilter)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
                >
                  <option value="last30">Last 30 days</option>
                  <option value="custom">Select date</option>
                </select>
                {salesFilter === "custom" ? (
                  <>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
                    />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700"
                    />
                  </>
                ) : null}
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Total sales: {"\u20B9"}{soldAmount}
            </p>
            {isProductsLoading ? (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Loading sales graph...</p>
            ) : salesByProduct.length === 0 ? (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">No sales data available.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {salesByProduct.map((entry) => (
                  <div key={entry.productId}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{entry.name}</span>
                      <span className="font-medium">
                        {entry.units} sold | {"\u20B9"}
                        {entry.value}
                      </span>
                    </div>
                    <div className="h-3 rounded bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-3 rounded bg-sky-600 dark:bg-sky-400"
                        style={{
                          width: `${maxSalesValue === 0 ? 0 : Math.max((entry.value / maxSalesValue) * 100, 6)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold">Stock Alerts</h2>
            {isProductsLoading ? (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Loading inventory...</p>
            ) : stockAlertItems.length === 0 ? (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">No stock alerts currently.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {stockAlertItems.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.name}: stock {item.stock} (reorder at {"<="} {item.reorderThreshold})
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold">Add New Items</h2>
            <form onSubmit={handleNewProductSubmit} className="mt-3 grid gap-3">
              <input
                required
                value={newProductForm.name}
                onChange={(event) =>
                  setNewProductForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Product Name"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              />
              <input
                value={newProductForm.imageUrl}
                onChange={(event) =>
                  setNewProductForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
                placeholder="Image URL (optional)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              />
              <input
                value={newProductForm.description}
                onChange={(event) =>
                  setNewProductForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Description (optional)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              />
              <button
                type="submit"
                disabled={isActionLoading}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                {isActionLoading ? "Saving..." : "Add Product"}
              </button>
              {actionTarget === "add" && actionError ? (
                <p className="text-sm text-rose-600 dark:text-rose-400">{actionError}</p>
              ) : null}
              {actionTarget === "add" && actionInfo ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{actionInfo}</p>
              ) : null}
            </form>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold">Update Item Details</h3>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <select
                  value={selectedProductId}
                  onChange={(event) => {
                    setSelectedProductId(event.target.value);
                    const selected = products.find((item) => item.id === event.target.value);
                    if (selected) {
                      setUnitInput(selected.quantity ?? "");
                      setPriceInput(`${selected.price ?? 0}`);
                      setDisplayOrderInput(`${selected.displayOrder ?? 1}`);
                      setReorderThresholdInput(`${selected.reorderThreshold}`);
                      setStockInput(`${selected.stock ?? 0}`);
                      setSelectedCategory(selected.category ?? "Essentials");
                    }
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                >
                  <option value="">Select Item</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                <div className="md:col-span-2" />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                  >
                    <option value="Grains">Grains</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Essentials">Essentials</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Order</label>
                  <input
                    type="number"
                    min="0"
                    value={displayOrderInput}
                    onChange={(event) => setDisplayOrderInput(event.target.value)}
                    placeholder="Set order"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Unit</label>
                  <input
                    value={unitInput}
                    onChange={(event) => setUnitInput(event.target.value)}
                    placeholder="1 kg / 1 litre / 1 piece / 12"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                    placeholder="Price"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reorder level</label>
                  <input
                    type="number"
                    min="0"
                    value={reorderThresholdInput}
                    onChange={(event) => setReorderThresholdInput(event.target.value)}
                    placeholder="Reorder level"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stockInput}
                    onChange={(event) => setStockInput(event.target.value)}
                    placeholder="Stock"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleUpdateItemDetails}
                  className="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-70 md:col-span-2 dark:bg-sky-500 dark:text-slate-900 dark:hover:bg-sky-400"
                >
                  {isActionLoading ? "Updating..." : "Update"}
                </button>
                {actionTarget === "update" && actionError ? (
                  <p className="text-sm text-rose-600 md:col-span-2 dark:text-rose-400">{actionError}</p>
                ) : null}
                {actionTarget === "update" && actionInfo ? (
                  <p className="text-sm text-emerald-700 md:col-span-2 dark:text-emerald-400">{actionInfo}</p>
                ) : null}
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold">Current Stock</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-700">
                    <th className="px-2 py-2">Item</th>
                    <th className="px-2 py-2">Category</th>
                    <th className="px-2 py-2">Stock</th>
                    <th className="px-2 py-2">Reorder</th>
                    <th className="px-2 py-2">Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {isProductsLoading ? (
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td colSpan={5} className="px-2 py-2 text-slate-700 dark:text-slate-300">
                        Loading stock data...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <td colSpan={5} className="px-2 py-2 text-slate-700 dark:text-slate-300">
                        No inventory data available.
                      </td>
                    </tr>
                  ) : (
                    products.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="px-2 py-2">{item.name}</td>
                        <td className="px-2 py-2">{item.category}</td>
                        <td className="px-2 py-2">{item.stock}</td>
                        <td className="px-2 py-2">{item.reorderThreshold}</td>
                        <td className="px-2 py-2">{inventoryMap.get(item.id)?.sold ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
