export type ProductItem = {
  id: string;
  name: string;
  imageUrl: string;
  quantity: string;
  price: number;
  description: string;
};

export type ProductCategory = "All" | "Grains" | "Vegetables" | "Dairy" | "Pulses" | "Fruits" | "Essentials";
