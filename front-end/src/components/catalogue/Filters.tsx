type PriceSort = 'default' | 'low-to-high' | 'high-to-low';

type FiltersProps = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceSort: PriceSort;
  onPriceSortChange: (sort: PriceSort) => void;
  itemCount: number;
  isLoading: boolean;
  hasError: boolean;
};

const categories = [
  'All',
  'Grains',
  'Vegetables',
  'Dairy',
  'Pulses',
  'Fruits',
  'Essentials',
];

function Filters({
  selectedCategory,
  onCategoryChange,
  priceSort,
  onPriceSortChange,
  itemCount,
  isLoading,
  hasError,
}: FiltersProps) {
  return (
    <aside className="rounded-lg border border-slate-300 bg-white p-4 lg:col-span-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-lg font-semibold">Quick Filters</h3>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
        Filter by category and sort by price.
      </p>

      <div className="mt-4">
        <p className="text-sm font-medium">Category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="price-sort" className="text-sm font-medium">
          Sort by Price
        </label>
        <select
          id="price-sort"
          value={priceSort}
          onChange={(event) =>
            onPriceSortChange(event.target.value as PriceSort)
          }
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
        >
          <option value="default">Default</option>
          <option value="low-to-high">Low to High</option>
          <option value="high-to-low">High to Low</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
        Showing {isLoading || hasError ? 0 : itemCount} item(s)
      </p>
    </aside>
  );
}

export default Filters;
