import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { graphqlRequest } from '../api/graphqlClient';
import { GET_ACTIVE_PRODUCTS_WITH_INVENTORY } from '../api/operations';
import AppHeader from '../components/AppHeader';
import StoreLogo from '../components/StoreLogo';
import ThemeToggleButton from '../components/ThemeToggleButton';

type GroceryPrice = {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
};

type PriceSort = 'default' | 'low-to-high' | 'high-to-low';

type StudentItem = {
  item: string;
  quantity: string;
  price: number;
};

type HasuraProductsResponse = {
  products: Array<{
    id: string;
    name: string;
    image_url: string;
    unit: string;
    price: number;
    inventory: Array<{ stock: number }>;
  }>;
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

function CataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<PriceSort>('default');
  const [studentItems, setStudentItems] = useState<StudentItem[]>([]);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<GroceryPrice[]>([]);
  const [groceryError, setGroceryError] = useState<string | null>(null);

  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const loadStudentItems = async () => {
      try {
        setStudentsError(null);
        const response = await fetch('http://localhost:5000/api/catalogue/students');
        if (!response.ok) {
          throw new Error('Failed to load student items');
        }
        const data = (await response.json()) as StudentItem[];
        setStudentItems(data);
      } catch (error) {
        setStudentsError(error instanceof Error ? error.message : 'Something went wrong');
      }
    };

    void loadStudentItems();
  }, []);

  useEffect(() => {
    const loadGroceryItems = async () => {
      try {
        setGroceryError(null);
        const data = await graphqlRequest<HasuraProductsResponse>(
          GET_ACTIVE_PRODUCTS_WITH_INVENTORY
        );

        let mappedItems: GroceryPrice[] = data.products.map((product) => ({
          id: product.id,
          name: product.name,
          quantity: product.unit,
          price: Number(product.price),
          category: 'All'
        }));

        const categoryMap: Record<string, string> = {
          Rice: 'Grains',
          'Brown Rice': 'Grains',
          Wheat: 'Grains',
          Corn: 'Grains',
          Tomato: 'Vegetables',
          Potato: 'Vegetables',
          Onion: 'Vegetables',
          Egg: 'Dairy',
          Milk: 'Dairy',
          Curd: 'Dairy',
          Paneer: 'Dairy',
          Sugar: 'Essentials',
          Salt: 'Essentials',
          'Cooking Oil': 'Essentials',
          'Toor Dal': 'Pulses',
          Apple: 'Fruits',
          Banana: 'Fruits'
        };

        mappedItems = mappedItems.map((item) => ({
          ...item,
          category: categoryMap[item.name] ?? 'Essentials'
        }));

        if (selectedCategory !== 'All') {
          mappedItems = mappedItems.filter(
            (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        if (priceSort === 'low-to-high') {
          mappedItems = [...mappedItems].sort((a, b) => a.price - b.price);
        } else if (priceSort === 'high-to-low') {
          mappedItems = [...mappedItems].sort((a, b) => b.price - a.price);
        } else if (selectedCategory.toLowerCase() === 'grains') {
          const grainOrder: Record<string, number> = {
            Rice: 0,
            'Brown Rice': 1,
            Wheat: 2,
            Corn: 3
          };
          mappedItems = [...mappedItems].sort(
            (a, b) => (grainOrder[a.name] ?? Number.MAX_SAFE_INTEGER) - (grainOrder[b.name] ?? Number.MAX_SAFE_INTEGER)
          );
        }

        setVisibleItems(mappedItems);
      } catch (error) {
        setGroceryError(error instanceof Error ? error.message : 'Something went wrong');
      }
    };

    void loadGroceryItems();
  }, [selectedCategory, priceSort]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={(
          <StoreLogo
            className="h-12 mt-1"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
        )}
        right={(
          <div className="flex items-center gap-2">
            <Link
              to="/faq"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              FAQ
            </Link>
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Back to Home
            </Link>
            <ThemeToggleButton />
          </div>
        )}
      />

      <main className="w-full px-6 py-10">
        <div className="w-full">
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
                      key={grocery.id}
                      className="border-t border-slate-300 dark:border-slate-700"
                    >
                      <td className="px-4 py-3">{grocery.name}</td>
                      <td className="px-4 py-3">{grocery.quantity}</td>
                      <td className="px-4 py-3">
                        {'\u20B9'}
                        {grocery.price}
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
              {groceryError ? (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                  {groceryError}
                </p>
              ) : null}
            </aside>
          </section>

          <section className="mt-8 w-full lg:w-8/12">
            <h3 className="text-2xl font-bold">Students</h3>
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700">
              <table className="min-w-full bg-white text-left dark:bg-slate-800">
                <thead className="bg-slate-200 text-sm uppercase tracking-wide dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {studentItems.map((studentItem) => (
                    <tr
                      key={studentItem.item}
                      className="border-t border-slate-300 dark:border-slate-700"
                    >
                      <td className="px-4 py-3">{studentItem.item}</td>
                      <td className="px-4 py-3">{studentItem.quantity}</td>
                      <td className="px-4 py-3">{studentItem.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {studentsError ? (
              <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                {studentsError}
              </p>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

export default CataloguePage;

