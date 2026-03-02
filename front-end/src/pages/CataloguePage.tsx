import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StoreLogo from '../components/StoreLogo';
import ThemeToggleButton from '../components/ThemeToggleButton';

type GroceryPrice = {
  item: string;
  quantity: string;
  priceInRupees: number;
  category: string;
};

type PriceSort = 'default' | 'low-to-high' | 'high-to-low';

const groceryPriceList: GroceryPrice[] = [
  { item: 'Rice', quantity: '1 kg', priceInRupees: 50, category: 'Grains' },
  { item: 'Egg', quantity: '12', priceInRupees: 72, category: 'Dairy' },
  {
    item: 'Tomato',
    quantity: '1 kg',
    priceInRupees: 30,
    category: 'Vegetables',
  },
  {
    item: 'Potato',
    quantity: '1 kg',
    priceInRupees: 35,
    category: 'Vegetables',
  },
  {
    item: 'Onion',
    quantity: '1 kg',
    priceInRupees: 40,
    category: 'Vegetables',
  },
  {
    item: 'Wheat Flour',
    quantity: '1 kg',
    priceInRupees: 45,
    category: 'Grains',
  },
  {
    item: 'Sugar',
    quantity: '1 kg',
    priceInRupees: 48,
    category: 'Essentials',
  },
  { item: 'Salt', quantity: '1 kg', priceInRupees: 20, category: 'Essentials' },
  { item: 'Milk', quantity: '1 liter', priceInRupees: 56, category: 'Dairy' },
  { item: 'Curd', quantity: '500 g', priceInRupees: 35, category: 'Dairy' },
  { item: 'Paneer', quantity: '200 g', priceInRupees: 90, category: 'Dairy' },
  {
    item: 'Cooking Oil',
    quantity: '1 liter',
    priceInRupees: 145,
    category: 'Essentials',
  },
  {
    item: 'Toor Dal',
    quantity: '1 kg',
    priceInRupees: 130,
    category: 'Pulses',
  },
  {
    item: 'Moong Dal',
    quantity: '1 kg',
    priceInRupees: 120,
    category: 'Pulses',
  },
  {
    item: 'Chana Dal',
    quantity: '1 kg',
    priceInRupees: 95,
    category: 'Pulses',
  },
  { item: 'Apple', quantity: '1 kg', priceInRupees: 140, category: 'Fruits' },
  { item: 'Banana', quantity: '12', priceInRupees: 60, category: 'Fruits' },
  { item: 'Orange', quantity: '1 kg', priceInRupees: 95, category: 'Fruits' },
  {
    item: 'Tea Powder',
    quantity: '250 g',
    priceInRupees: 110,
    category: 'Beverages',
  },
  {
    item: 'Coffee Powder',
    quantity: '200 g',
    priceInRupees: 160,
    category: 'Beverages',
  },
];

const categories = [
  'All',
  'Grains',
  'Vegetables',
  'Dairy',
  'Pulses',
  'Fruits',
  'Beverages',
  'Essentials',
];

function CataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<PriceSort>('default');

  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const visibleItems = useMemo(() => {
    console.count('visibleItems computed');
    const filteredItems =
      selectedCategory === 'All'
        ? groceryPriceList
        : groceryPriceList.filter((item) => item.category === selectedCategory);

    if (priceSort === 'default') {
      return filteredItems;
    }

    return [...filteredItems].sort((a, b) => {
      if (priceSort === 'low-to-high') {
        return a.priceInRupees - b.priceInRupees;
      }
      return b.priceInRupees - a.priceInRupees;
    });
  }, [priceSort, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Back to Home
            </Link>
            <ThemeToggleButton />
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold">Grocery Price List</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Latest updated on: {todayDate}
          </p>

          <section className="mt-6 grid gap-6 lg:grid-cols-12">
            <div className="overflow-x-auto rounded-lg border border-slate-300 lg:col-span-8 dark:border-slate-700">
              <table className="min-w-full bg-white text-left dark:bg-slate-800">
                <thead className="bg-slate-200 text-sm uppercase tracking-wide dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((grocery) => (
                    <tr
                      key={grocery.item}
                      className="border-t border-slate-300 dark:border-slate-700"
                    >
                      <td className="px-4 py-3">{grocery.item}</td>
                      <td className="px-4 py-3">{grocery.quantity}</td>
                      <td className="px-4 py-3">
                        {'\u20B9'}
                        {grocery.priceInRupees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                      onClick={() => setSelectedCategory(category)}
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
                    setPriceSort(event.target.value as PriceSort)
                  }
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                >
                  <option value="default">Default</option>
                  <option value="low-to-high">Low to High</option>
                  <option value="high-to-low">High to Low</option>
                </select>
              </div>

              <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
                Showing {visibleItems.length} item(s)
              </p>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CataloguePage;
