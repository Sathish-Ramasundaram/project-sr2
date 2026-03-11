import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import CatalogueTable from '@/components/catalogue/CatalogueTable';
import Filters from '@/components/catalogue/Filters';
import StudentTable from '@/components/catalogue/StudentTable';
import StoreLogo from '@/components/shared/StoreLogo';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { CATALOGUE_SYNC_KEY } from '@/utils/catalogueSync';
import { useCatalogueData } from '@/pages/catalogue/useCatalogueData';
import { useStudentData } from '@/pages/catalogue/useStudentData';

type PriceSort = 'default' | 'low-to-high' | 'high-to-low';

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
  const [reloadSignal, setReloadSignal] = useState(0);

  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const { visibleItems, groceryError, isGroceryLoading } = useCatalogueData(
    selectedCategory,
    priceSort,
    reloadSignal
  );
  const { studentItems, studentsError, isStudentsLoading } = useStudentData();

  useEffect(() => {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === CATALOGUE_SYNC_KEY) {
        setReloadSignal((current) => current + 1);
      }
    };

    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  return (
    <PageShell>
      <AppHeader
        left={
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
          />
        }
        right={
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
        }
      />

      <PageMain className="py-10">
        <div className="w-full">
          <h2 className="text-3xl font-extrabold">Grocery Price List</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Latest updated on: {todayDate}
          </p>

          <section className="mt-6 grid gap-6 lg:grid-cols-12">
            <CatalogueTable
              visibleItems={visibleItems}
              isGroceryLoading={isGroceryLoading}
              groceryError={groceryError}
            />

            <Filters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceSort={priceSort}
              onPriceSortChange={setPriceSort}
              itemCount={visibleItems.length}
              isLoading={isGroceryLoading}
              hasError={!!groceryError}
            />
          </section>

          <StudentTable
            studentItems={studentItems}
            isStudentsLoading={isStudentsLoading}
            studentsError={studentsError}
          />
        </div>
      </PageMain>
    </PageShell>
  );
}

export default CataloguePage;
