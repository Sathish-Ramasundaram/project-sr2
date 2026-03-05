import { useEffect, useState } from 'react';
import { formatBackendError } from '@/utils/apiError';

type GroceryPrice = {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
};

type PriceSort = 'default' | 'low-to-high' | 'high-to-low';

export function useCatalogueData(
  selectedCategory: string,
  priceSort: PriceSort,
  reloadSignal: number
) {
  const [visibleItems, setVisibleItems] = useState<GroceryPrice[]>([]);
  const [groceryError, setGroceryError] = useState<string | null>(null);
  const [isGroceryLoading, setIsGroceryLoading] = useState(true);

  useEffect(() => {
    const loadGroceryItems = async () => {
      try {
        setGroceryError(null);
        setIsGroceryLoading(true);
        const query = new URLSearchParams({
          category: selectedCategory,
          sort: priceSort,
        });
        const response = await fetch(
          `http://localhost:5000/api/catalogue/products?${query.toString()}`
        );
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = (await response.json()) as Array<{
          id: string;
          name: string;
          quantity: string;
          price: number;
          category: string;
        }>;
        const mappedItems: GroceryPrice[] = data.map((product) => ({
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          price: Number(product.price),
          category: product.category,
        }));

        setVisibleItems(mappedItems);
      } catch (error) {
        setVisibleItems([]);
        setGroceryError(formatBackendError(error, 'catalogue items'));
      } finally {
        setIsGroceryLoading(false);
      }
    };

    void loadGroceryItems();
  }, [selectedCategory, priceSort, reloadSignal]);

  return { visibleItems, groceryError, isGroceryLoading };
}
