import type { FormEvent } from 'react';
import AddProductForm from './AddProductForm';
import UpdateProductForm from './UpdateProductForm';

type NewProductForm = {
  name: string;
  description: string;
  imageUrl: string;
};

type ProductOption = {
  id: string;
  name: string;
};

type AdminProductManagementSectionProps = {
  newProductForm: NewProductForm;
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
  onNewProductSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNewProductFormChange: (field: keyof NewProductForm, value: string) => void;
  onSelectedProductChange: (value: string) => void;
  onSelectedCategoryChange: (value: string) => void;
  onDisplayOrderInputChange: (value: string) => void;
  onUnitInputChange: (value: string) => void;
  onPriceInputChange: (value: string) => void;
  onReorderThresholdInputChange: (value: string) => void;
  onStockInputChange: (value: string) => void;
  onUpdateItemDetails: () => void;
};

function AdminProductManagementSection({
  newProductForm,
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
  onNewProductSubmit,
  onNewProductFormChange,
  onSelectedProductChange,
  onSelectedCategoryChange,
  onDisplayOrderInputChange,
  onUnitInputChange,
  onPriceInputChange,
  onReorderThresholdInputChange,
  onStockInputChange,
  onUpdateItemDetails,
}: AdminProductManagementSectionProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <AddProductForm
        newProductForm={newProductForm}
        isActionLoading={isActionLoading}
        actionTarget={actionTarget}
        actionError={actionError}
        actionInfo={actionInfo}
        onNewProductSubmit={onNewProductSubmit}
        onNewProductFormChange={onNewProductFormChange}
      />

      <UpdateProductForm
        products={products}
        selectedProductId={selectedProductId}
        selectedCategory={selectedCategory}
        displayOrderInput={displayOrderInput}
        unitInput={unitInput}
        priceInput={priceInput}
        reorderThresholdInput={reorderThresholdInput}
        stockInput={stockInput}
        isActionLoading={isActionLoading}
        actionTarget={actionTarget}
        actionError={actionError}
        actionInfo={actionInfo}
        onSelectedProductChange={onSelectedProductChange}
        onSelectedCategoryChange={onSelectedCategoryChange}
        onDisplayOrderInputChange={onDisplayOrderInputChange}
        onUnitInputChange={onUnitInputChange}
        onPriceInputChange={onPriceInputChange}
        onReorderThresholdInputChange={onReorderThresholdInputChange}
        onStockInputChange={onStockInputChange}
        onUpdateItemDetails={onUpdateItemDetails}
      />
    </article>
  );
}

export default AdminProductManagementSection;
