import express, { NextFunction, Request, Response } from "express";

const app = express();
const port = 5000;

const studentItems = [
  {
    item: "Pencil",
    quantity: "1",
    price: 5
  }
];
type ProductItem = {
  id: string;
  name: string;
  imageUrl: string;
  quantity: string;
  price: number;
  description: string;
};

const getProductCategory = (productId: string): string => {
  const productCategories: Record<string, string> = {
    rice: "Grains",
    "wheat-flour": "Grains",
    tomato: "Vegetables",
    potato: "Vegetables",
    onion: "Vegetables",
    egg: "Dairy",
    milk: "Dairy",
    curd: "Dairy",
    paneer: "Dairy",
    sugar: "Essentials",
    salt: "Essentials",
    "cooking-oil": "Essentials",
    "toor-dal": "Pulses",
    apple: "Fruits",
    banana: "Fruits"
  };

  return productCategories[productId] ?? "Essentials";
};
const products: ProductItem[] = [
  {
    id: "rice",
    name: "Rice",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    quantity: "1 kg",
    price: 50,
    description: "Premium daily-use rice, cleaned and packed for household cooking."
  },
  {
    id: "egg",
    name: "Egg",
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
    quantity: "12",
    price: 72,
    description: "Farm fresh eggs, ideal for breakfast and baking."
  },
  {
    id: "tomato",
    name: "Tomato",
    imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80",
    quantity: "1 kg",
    price: 30,
    description: "Fresh red tomatoes suitable for curries, salads, and chutneys."
  },
  {
    id: "potato",
    name: "Potato",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    quantity: "1 kg",
    price: 35,
    description: "Multi-purpose potatoes for frying, boiling, and curry preparations."
  },
  {
    id: "onion",
    name: "Onion",
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80",
    quantity: "1 kg",
    price: 40,
    description: "Fresh onions with strong flavor for everyday cooking."
  },
  {
    id: "wheat-flour",
    name: "Wheat Flour",
    imageUrl: "https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Wheat_Flour.png",
    quantity: "1 kg",
    price: 45,
    description: "Fine wheat flour ideal for rotis, chapatis, and baking."
  },
  {
    id: "sugar",
    name: "Sugar",
    imageUrl: "https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Sugar.png",
    quantity: "1 kg",
    price: 48,
    description: "Refined white sugar for tea, coffee, and desserts."
  },
  {
    id: "salt",
    name: "Salt",
    imageUrl: "https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Salt.png",
    quantity: "1 kg",
    price: 20,
    description: "Iodized table salt for healthy daily consumption."
  },
  {
    id: "milk",
    name: "Milk",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    quantity: "1 liter",
    price: 56,
    description: "Fresh full-cream milk packed for daily nutrition."
  },
  {
    id: "curd",
    name: "Curd",
    imageUrl: "https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Curd.png",
    quantity: "500 g",
    price: 35,
    description: "Thick fresh curd for meals, raita, and smoothies."
  },
  {
    id: "paneer",
    name: "Paneer",
    imageUrl: "https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Paneer.png",
    quantity: "200 g",
    price: 90,
    description: "Soft paneer cubes suitable for curries and snacks."
  },
  {
    id: "cooking-oil",
    name: "Cooking Oil",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    quantity: "1 liter",
    price: 145,
    description: "Refined cooking oil for daily frying and sauteing."
  },
  {
    id: "toor-dal",
    name: "Toor Dal",
    imageUrl: "https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/Toor%20Dal.png",
    quantity: "1 kg",
    price: 130,
    description: "High-quality toor dal for nutritious everyday meals."
  },
  {
    id: "apple",
    name: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80",
    quantity: "1 kg",
    price: 140,
    description: "Fresh apples with a crisp bite and natural sweetness."
  },
  {
    id: "banana",
    name: "Banana",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    quantity: "12",
    price: 60,
    description: "Naturally sweet bananas, great for snacks and smoothies."
  }
];
type FaqItem = {
  id: number;
  question: string;
};
const faqItems: FaqItem[] = [];
let nextFaqId = 1;

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});


app.get("/api/catalogue/students", (_req: Request, res: Response) => {
  res.json(studentItems);
});

app.get("/api/products", (req: Request, res: Response) => {
  const categoryQuery =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const sortQuery = typeof req.query.sort === "string" ? req.query.sort : "default";

  let filteredProducts = [...products];

  if (categoryQuery && categoryQuery !== "All") {
    filteredProducts = filteredProducts.filter(
      (product) => getProductCategory(product.id).toLowerCase() === categoryQuery.toLowerCase()
    );
  }

  if (sortQuery === "low-to-high") {
    filteredProducts.sort((left, right) => left.price - right.price);
  } else if (sortQuery === "high-to-low") {
    filteredProducts.sort((left, right) => right.price - left.price);
  }

  res.json(
    filteredProducts.map((product) => ({
      ...product,
      category: getProductCategory(product.id)
    }))
  );
});

app.get("/api/products/:id", (req: Request, res: Response) => {
  const productId = req.params.id;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.json(product);
});

app.get("/api/faqs", (_req: Request, res: Response) => {
  res.json(faqItems);
});

app.post("/api/faqs", (req: Request, res: Response) => {
  const questionValue = req.body?.question;
  if (typeof questionValue !== "string" || !questionValue.trim()) {
    res.status(400).json({ message: "Question is required" });
    return;
  }

  const faqItem: FaqItem = {
    id: nextFaqId,
    question: questionValue.trim()
  };
  nextFaqId += 1;
  faqItems.push(faqItem);
  res.status(201).json(faqItem);
});

app.get("/api/error-test", (_req: Request, _res: Response, next: NextFunction) => {
  next(new Error("Demo error from /api/error-test"));
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "SR Store API is running",
    time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", error.message);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
