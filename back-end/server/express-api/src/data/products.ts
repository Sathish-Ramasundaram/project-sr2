import { ProductItem } from '../types/product';

const productCategories: Record<string, string> = {
  rice: 'Grains',
  'brown-rice': 'Grains',
  wheat: 'Grains',
  corn: 'Grains',
  tomato: 'Vegetables',
  potato: 'Vegetables',
  onion: 'Vegetables',
  egg: 'Dairy',
  milk: 'Dairy',
  curd: 'Dairy',
  paneer: 'Dairy',
  sugar: 'Essentials',
  salt: 'Essentials',
  'cooking-oil': 'Essentials',
  'toor-dal': 'Pulses',
  apple: 'Fruits',
  banana: 'Fruits',
};

const grainDisplayOrder: Record<string, number> = {
  rice: 0,
  'brown-rice': 1,
  wheat: 2,
  corn: 3,
};

export const getProductCategory = (productId: string): string => {
  return productCategories[productId] ?? 'Essentials';
};

export const sortProducts = (
  items: ProductItem[],
  sortQuery: string,
  categoryQuery: string
): ProductItem[] => {
  if (sortQuery === 'low-to-high') {
    return [...items].sort((left, right) => left.price - right.price);
  }

  if (sortQuery === 'high-to-low') {
    return [...items].sort((left, right) => right.price - left.price);
  }

  if (categoryQuery.toLowerCase() === 'grains') {
    return [...items].sort((left, right) => {
      const leftOrder = grainDisplayOrder[left.id];
      const rightOrder = grainDisplayOrder[right.id];
      const leftValue =
        leftOrder === undefined ? Number.MAX_SAFE_INTEGER : leftOrder;
      const rightValue =
        rightOrder === undefined ? Number.MAX_SAFE_INTEGER : rightOrder;
      return leftValue - rightValue;
    });
  }

  return items;
};

export const products: ProductItem[] = [
  {
    id: 'rice',
    name: 'Rice',
    imageUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    quantity: '1 kg',
    price: 50,
    description:
      'Premium daily-use rice, cleaned and packed for household cooking.',
  },
  {
    id: 'brown-rice',
    name: 'Brown Rice',
    imageUrl:
      'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/BrownRice.png',
    quantity: '1 kg',
    price: 65,
    description:
      'Nutritious whole-grain brown rice with natural fiber and rich taste.',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    imageUrl:
      'https://images.unsplash.com/photo-1592997571659-0b21ff64313b?auto=format&fit=crop&w=800&q=80',
    quantity: '1 kg',
    price: 42,
    description:
      'Whole wheat grains suitable for milling, porridge, and healthy meals.',
  },
  {
    id: 'corn',
    name: 'Corn',
    imageUrl:
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    quantity: '1 kg',
    price: 38,
    description:
      'Fresh dried corn kernels for snacks, soups, and traditional recipes.',
  },
  {
    id: 'egg',
    name: 'Egg',
    imageUrl:
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
    quantity: '12',
    price: 72,
    description: 'Farm fresh eggs, ideal for breakfast and baking.',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    imageUrl:
      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    quantity: '1 kg',
    price: 30,
    description:
      'Fresh red tomatoes suitable for curries, salads, and chutneys.',
  },
  {
    id: 'potato',
    name: 'Potato',
    imageUrl:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    quantity: '1 kg',
    price: 35,
    description:
      'Multi-purpose potatoes for frying, boiling, and curry preparations.',
  },
  {
    id: 'onion',
    name: 'Onion',
    imageUrl:
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    quantity: '1 kg',
    price: 40,
    description: 'Fresh onions with strong flavor for everyday cooking.',
  },
  {
    id: 'sugar',
    name: 'Sugar',
    imageUrl:
      'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Sugar.png',
    quantity: '1 kg',
    price: 48,
    description: 'Refined white sugar for tea, coffee, and desserts.',
  },
  {
    id: 'salt',
    name: 'Salt',
    imageUrl:
      'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Salt.png',
    quantity: '1 kg',
    price: 20,
    description: 'Iodized table salt for healthy daily consumption.',
  },
  {
    id: 'milk',
    name: 'Milk',
    imageUrl:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    quantity: '1 liter',
    price: 56,
    description: 'Fresh full-cream milk packed for daily nutrition.',
  },
  {
    id: 'curd',
    name: 'Curd',
    imageUrl:
      'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Curd.png',
    quantity: '500 g',
    price: 35,
    description: 'Thick fresh curd for meals, raita, and smoothies.',
  },
  {
    id: 'paneer',
    name: 'Paneer',
    imageUrl:
      'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Paneer.png',
    quantity: '200 g',
    price: 90,
    description: 'Soft paneer cubes suitable for curries and snacks.',
  },
  {
    id: 'cooking-oil',
    name: 'Cooking Oil',
    imageUrl:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    quantity: '1 liter',
    price: 145,
    description: 'Refined cooking oil for daily frying and sauteing.',
  },
  {
    id: 'toor-dal',
    name: 'Toor Dal',
    imageUrl:
      'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Toor%20Dal.png',
    quantity: '1 kg',
    price: 130,
    description: 'High-quality toor dal for nutritious everyday meals.',
  },
  {
    id: 'apple',
    name: 'Apple',
    imageUrl:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
    quantity: '1 kg',
    price: 140,
    description: 'Fresh apples with a crisp bite and natural sweetness.',
  },
  {
    id: 'banana',
    name: 'Banana',
    imageUrl:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
    quantity: '12',
    price: 60,
    description: 'Naturally sweet bananas, great for snacks and smoothies.',
  },
];
