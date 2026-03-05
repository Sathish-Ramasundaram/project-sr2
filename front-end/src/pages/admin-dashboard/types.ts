export type SalesFilter = "last30" | "custom";
export type SalesRankMode = "top" | "least";
export type ActionTarget = "add" | "update" | null;

export type AdminProduct = {
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

export type NewProductForm = {
  name: string;
  description: string;
  imageUrl: string;
};

export type SalesSummaryItem = {
  productId: string;
  name: string;
  units: number;
  value: number;
};

export type SalesSummaryResponse = {
  from: string;
  to: string;
  totalRevenue: number;
  items: SalesSummaryItem[];
};
