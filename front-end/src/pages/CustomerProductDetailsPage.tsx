import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StoreLogo from "../components/StoreLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";
import type { Product } from "../types/product";

function CustomerProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (!response.ok) {
          setProduct(null);
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as Product;
        setProduct(data);
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    void loadProduct();
  }, [productId]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
          <ThemeToggleButton />
        </div>
      </header>

      <main className="px-6 py-10">
        {isLoading ? (
          <div className="mx-auto max-w-3xl rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-2xl font-bold">Loading product...</h2>
          </div>
        ) : !product ? (
          <div className="mx-auto max-w-3xl rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-2xl font-bold">Product not found</h2>
            <Link to="/customer/home" className="mt-3 inline-block text-sm text-sky-700 hover:underline dark:text-sky-400">
              Back
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <Link to="/customer/home" className="text-sm text-sky-700 hover:underline dark:text-sky-400">
                Back
              </Link>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <img src={product.imageUrl} alt={product.name} className="h-72 w-full rounded-md object-cover" />
              <div>
                <h2 className="text-3xl font-extrabold">{product.name}</h2>
                <p className="mt-2 text-slate-700 dark:text-slate-300">{product.description}</p>
                <p className="mt-4 text-sm">Quantity: {product.quantity}</p>
                <p className="mt-2 text-lg font-semibold">
                  {"\u20B9"}
                  {product.price}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerProductDetailsPage;
