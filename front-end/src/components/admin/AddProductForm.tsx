import type { FormEvent } from 'react';

type NewProductForm = {
  name: string;
  description: string;
  imageUrl: string;
};

type AddProductFormProps = {
  newProductForm: NewProductForm;
  isActionLoading: boolean;
  actionTarget: 'add' | 'update' | null;
  actionError: string | null;
  actionInfo: string | null;
  onNewProductSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNewProductFormChange: (field: keyof NewProductForm, value: string) => void;
};

function AddProductForm({
  newProductForm,
  isActionLoading,
  actionTarget,
  actionError,
  actionInfo,
  onNewProductSubmit,
  onNewProductFormChange,
}: AddProductFormProps) {
  return (
    <>
      <h2 className="text-lg font-semibold">Add New Items</h2>
      <form onSubmit={onNewProductSubmit} className="mt-3 grid gap-3">
        <input
          required
          value={newProductForm.name}
          onChange={(event) =>
            onNewProductFormChange('name', event.target.value)
          }
          placeholder="Product Name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
        />
        <input
          value={newProductForm.imageUrl}
          onChange={(event) =>
            onNewProductFormChange('imageUrl', event.target.value)
          }
          placeholder="Image URL (optional)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
        />
        <input
          value={newProductForm.description}
          onChange={(event) =>
            onNewProductFormChange('description', event.target.value)
          }
          placeholder="Description (optional)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
        />
        <button
          type="submit"
          disabled={isActionLoading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {isActionLoading ? 'Saving...' : 'Add Product'}
        </button>
        {actionTarget === 'add' && actionError ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {actionError}
          </p>
        ) : null}
        {actionTarget === 'add' && actionInfo ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {actionInfo}
          </p>
        ) : null}
      </form>
    </>
  );
}

export default AddProductForm;
