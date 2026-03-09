import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { graphqlRequest } from "@/api/graphqlClient";
import { GET_PRODUCT_BY_ID } from "@/api/operations";
import AppHeader from "@/components/AppHeader";
import PageMain from "@/components/PageMain";
import PageShell from "@/components/PageShell";
import StoreLogo from "@/components/StoreLogo";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { formatBackendError } from "@/utils/apiError";
import type { Product } from "@/types/product";

type HasuraProductByIdResponse = {
  products_by_pk: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    unit: string;
    price: number;
    is_active: boolean;
  } | null;
};

function CustomerProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setProduct(null);
        setProductError(null);
        setIsLoading(false);
        return;
      }

      try {
        setProductError(null);
        const data = await graphqlRequest<HasuraProductByIdResponse>(
          GET_PRODUCT_BY_ID,
          { id: productId }
        );

        if (!data.products_by_pk || !data.products_by_pk.is_active) {
          setProduct(null);
          setIsLoading(false);
          return;
        }

        const mappedProduct: Product = {
          id: data.products_by_pk.id,
          name: data.products_by_pk.name,
          imageUrl: data.products_by_pk.image_url ?? "",
          quantity: data.products_by_pk.unit,
          price: Number(data.products_by_pk.price),
          description: data.products_by_pk.description ?? ""
        };
        setProduct(mappedProduct);
      } catch (error) {
        setProduct(null);
        setProductError(formatBackendError(error, "product details"));
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    void loadProduct();
  }, [productId]);

  return (
    <PageShell>
      <AppHeader
        left={(
          <StoreLogo
            className="h-12"
            imgClassName="h-12 w-auto"
            textClassName="text-xl font-bold"
          />
        )}
        right={<ThemeToggleButton />}
      />

      <PageMain className="py-10">
        {isLoading ? (
          <div className="mx-auto max-w-3xl rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-2xl font-bold">Loading product...</h2>
          </div>
        ) : !product ? (
          <div className="mx-auto max-w-3xl rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-2xl font-bold">{productError ? "Unable to load product" : "Product not found"}</h2>
            {productError ? (
              <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{productError}</p>
            ) : null}
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
      </PageMain>
    </PageShell>
  );
}

export default CustomerProductDetailsPage;




