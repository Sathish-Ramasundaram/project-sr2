import { useCallback, useEffect, useMemo, useState } from "react";
import { formatBackendError } from "@/utils/apiError";
import { endOfDay, startOfDay, toInputDate } from "@/pages/admin-dashboard/dateUtils";
import type {
  SalesFilter,
  SalesRankMode,
  SalesSummaryItem,
  SalesSummaryResponse
} from "@/pages/admin-dashboard/types";
import { getAdminToken } from "@/store/admin/adminStorage";

export function useAdminSalesData() {
  const [salesByProduct, setSalesByProduct] = useState<SalesSummaryItem[]>([]);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [isSalesLoading, setIsSalesLoading] = useState(true);
  const [soldAmount, setSoldAmount] = useState(0);
  const [salesFilter, setSalesFilter] = useState<SalesFilter>("last30");
  const [salesRankMode, setSalesRankMode] = useState<SalesRankMode>("top");
  const [graphProductCount, setGraphProductCount] = useState(5);
  const [fromDate, setFromDate] = useState<string>(() =>
    toInputDate(startOfDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)))
  );
  const [toDate, setToDate] = useState<string>(() => toInputDate(new Date()));

  const getAuthHeaders = useCallback(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const filterRange = useMemo(() => {
    const now = new Date();
    let filterStart = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
    let filterEnd = endOfDay(now);

    if (salesFilter === "custom") {
      if (fromDate) {
        filterStart = startOfDay(new Date(fromDate));
      }
      if (toDate) {
        filterEnd = endOfDay(new Date(toDate));
      }
    }

    return {
      from: filterStart,
      to: filterEnd
    };
  }, [fromDate, salesFilter, toDate]);

  const refreshSalesSummary = useCallback(async () => {
    try {
      setSalesError(null);
      setIsSalesLoading(true);

      const query = new URLSearchParams({
        from: filterRange.from.toISOString(),
        to: filterRange.to.toISOString()
      });
      const response = await fetch(
        `http://localhost:5000/api/admin/products/sales-summary?${query.toString()}`,
        { headers: getAuthHeaders() }
      );
      const body = (await response.json()) as SalesSummaryResponse | { message?: string };
      if (!response.ok) {
        throw new Error(
          "message" in body && body.message ? body.message : "Failed to load sales summary."
        );
      }

      const data = body as SalesSummaryResponse;
      setSalesByProduct(data.items ?? []);
      setSoldAmount(Number(data.totalRevenue ?? 0));
    } catch (error) {
      setSalesByProduct([]);
      setSoldAmount(0);
      setSalesError(formatBackendError(error, "sales summary"));
    } finally {
      setIsSalesLoading(false);
    }
  }, [filterRange.from, filterRange.to, getAuthHeaders]);

  useEffect(() => {
    void refreshSalesSummary();
  }, [refreshSalesSummary]);

  useEffect(() => {
    const refreshOnInterval = () => {
      void refreshSalesSummary();
    };

    const intervalId = window.setInterval(refreshOnInterval, 10000);
    window.addEventListener("focus", refreshOnInterval);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnInterval);
    };
  }, [refreshSalesSummary]);

  const soldMap = useMemo(() => {
    const result = new Map<string, number>();
    salesByProduct.forEach((item) => {
      result.set(item.productId, item.units);
    });
    return result;
  }, [salesByProduct]);

  const graphSalesByProduct = useMemo(() => {
    const sorted = [...salesByProduct].sort((left, right) =>
      salesRankMode === "top" ? right.value - left.value : left.value - right.value
    );
    return sorted.slice(0, graphProductCount);
  }, [graphProductCount, salesByProduct, salesRankMode]);

  const maxSalesValue = Math.max(...graphSalesByProduct.map((entry) => entry.value), 0);

  return {
    salesByProduct,
    salesError,
    isSalesLoading,
    soldAmount,
    salesFilter,
    setSalesFilter,
    salesRankMode,
    setSalesRankMode,
    graphProductCount,
    setGraphProductCount,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    soldMap,
    graphSalesByProduct,
    maxSalesValue,
    refreshSalesSummary
  };
}
