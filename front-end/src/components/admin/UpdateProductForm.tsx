type ProductOption = {
  id: string;
  name: string;
};

type UpdateProductFormProps = {
  products: ProductOption[];
  selectedProductId: string;
  selectedCategory: string;
  displayOrderInput: string;
  unitInput: string;
  priceInput: string;
  reorderThresholdInput: string;
  stockInput: string;
  isActionLoading: boolean;
  actionTarget: 'add' | 'update' | null;
  actionError: string | null;
  actionInfo: string | null;
  onSelectedProductChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
  onDisplayOrderInputChange: (value: string) => void;
  onUnitInputChange: (value: string) => void;
  onPriceInputChange: (value: string) => void;
  onReorderThresholdInputChange: (value: string) => void;
  onStockInputChange: (value: string) => void;
  onUpdateItemDetails: () => void;
  onDeactivateProduct: () => void;
};

function UpdateProductForm({
  products,
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
  onSelectedProductChange,
  onSelectedCategoryChange,
  onDisplayOrderInputChange,
  onUnitInputChange,
  onPriceInputChange,
  onReorderThresholdInputChange,
  onStockInputChange,
  onUpdateItemDetails,
  onDeactivateProduct,
}: UpdateProductFormProps) {
  return (
    <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
      <h3 className="text-lg font-semibold">Update Item Details</h3>
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <select
          value={selectedProductId}
          onChange={(event) => onSelectedProductChange(event.target.value)}
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(event) => onSelectedCategoryChange(event.target.value)}
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Order
          </label>
          <input
            type="number"
            min="0"
            value={displayOrderInput}
            onChange={(event) => onDisplayOrderInputChange(event.target.value)}
            placeholder="Set order"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Unit
          </label>
          <input
            value={unitInput}
            onChange={(event) => onUnitInputChange(event.target.value)}
            placeholder="1 kg / 1 litre / 1 piece / 12"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceInput}
            onChange={(event) => onPriceInputChange(event.target.value)}
            placeholder="Price"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Reorder level
          </label>
          <input
            type="number"
            min="0"
            value={reorderThresholdInput}
            onChange={(event) =>
              onReorderThresholdInputChange(event.target.value)
            }
            placeholder="Reorder level"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Stock
          </label>
          <input
            type="number"
            min="0"
            value={stockInput}
            onChange={(event) => onStockInputChange(event.target.value)}
            placeholder="Stock"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
        </div>

        <div className="flex gap-2 md:col-span-2">
          <button
            type="button"
            disabled={isActionLoading}
            onClick={onUpdateItemDetails}
            className="flex-1 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-70 dark:bg-sky-500 dark:text-slate-900 dark:hover:bg-sky-400"
          >
            {isActionLoading ? 'Updating...' : 'Update'}
          </button>
          {selectedProductId ? (
            <button
              type="button"
              disabled={isActionLoading}
              onClick={onDeactivateProduct}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-70 dark:bg-rose-500 dark:hover:bg-rose-400"
            >
              Deactivate
            </button>
          ) : null}
        </div>
        {actionTarget === 'update' && actionError ? (
          <p className="text-sm text-rose-600 md:col-span-2 dark:text-rose-400">
            {actionError}
          </p>
        ) : null}
        {actionTarget === 'update' && actionInfo ? (
          <p className="text-sm text-emerald-700 md:col-span-2 dark:text-emerald-400">
            {actionInfo}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default UpdateProductForm;
