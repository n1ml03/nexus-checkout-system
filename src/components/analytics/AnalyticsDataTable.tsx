import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, BarChart2, ShoppingCart, Package } from "lucide-react";

import { AnalyticsData, ProductSalesDataPoint } from "@/types";
import EmptyState from "@/components/ui/empty-state";
import ChartSkeleton from "@/components/ui/chart-skeleton";

interface AnalyticsDataTableProps {
  data: AnalyticsData;
  type: "products" | "categories" | "sales";
  isLoading?: boolean;
}

export function AnalyticsDataTable({ data, type, isLoading = false }: AnalyticsDataTableProps) {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  }>({
    key: "sales",
    direction: "descending",
  });

  // Get the appropriate data based on type
  const getTableData = () => {
    switch (type) {
      case "products":
        return data.topProducts;
      case "categories":
        return data.categoryData;
      case "sales":
        return data.salesData;
      default:
        return [];
    }
  };

  // Get all data without filtering
  const filteredData = getTableData();

  // Sort data based on sort config
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Handle sort request
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Render table headers based on type
  const renderHeaders = () => {
    switch (type) {
      case "products":
        return (
          <TableRow>
            <TableHead className="w-[300px]">
              <Button variant="ghost" onClick={() => requestSort("name")} className="flex items-center gap-1 px-0">
                {t("product.name")}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort("sales")} className="flex items-center gap-1 px-0 ml-auto">
                {t("analytics.sales")}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort("quantity")} className="flex items-center gap-1 px-0 ml-auto">
                {t("product.quantity")}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        );
      case "categories":
        return (
          <TableRow>
            <TableHead className="w-[300px]">
              <Button variant="ghost" onClick={() => requestSort("name")} className="flex items-center gap-1 px-0">
                {t("product.category")}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort("value")} className="flex items-center gap-1 px-0 ml-auto">
                {t("analytics.sales")}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        );
      case "sales":
        return (
          <TableRow>
            <TableHead className="w-[200px]">
              <Button variant="ghost" onClick={() => requestSort("month")} className="flex items-center gap-1 px-0">
                {t("analytics.month")}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort("sales")} className="flex items-center gap-1 px-0 ml-auto">
                {t("analytics.sales")}
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  // Render table rows based on type
  const renderRows = () => {
    switch (type) {
      case "products":
        return sortedData.map((product: ProductSalesDataPoint) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="text-right">${product.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
            <TableCell className="text-right">{product.quantity}</TableCell>
          </TableRow>
        ));
      case "categories":
        return sortedData.map((category: any, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell className="text-right">${category.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
          </TableRow>
        ));
      case "sales":
        return sortedData.map((sale: any, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{sale.month}</TableCell>
            <TableCell className="text-right">${sale.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
          </TableRow>
        ));
      default:
        return null;
    }
  };

  // Get the appropriate icon for empty state
  const getEmptyStateIcon = () => {
    switch (type) {
      case "products":
        return ShoppingCart;
      case "categories":
        return Package;
      case "sales":
        return BarChart2;
      default:
        return BarChart2;
    }
  };

  // Get the appropriate title for empty state
  const getEmptyStateTitle = () => {
    switch (type) {
      case "products":
        return t("analytics.no_product_data", "No product data available");
      case "categories":
        return t("analytics.no_category_data", "No category data available");
      case "sales":
        return t("analytics.no_sales_data", "No sales data available");
      default:
        return t("ui.no_items");
    }
  };

  // Get the appropriate description for empty state
  const getEmptyStateDescription = () => {
    return t("analytics.empty_data_description", "Data will appear here once sales are recorded");
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="p-4">
            <ChartSkeleton type="table" height={300} />
          </div>
        </div>
      </div>
    );
  }

  // Check if there's data to display
  const hasData = filteredData.length > 0;

  return (
    <div className="space-y-4">
      {!hasData ? (
        <div className="rounded-md border p-6">
          <EmptyState
            icon={getEmptyStateIcon()}
            title={getEmptyStateTitle()}
            description={getEmptyStateDescription()}
            size="md"
            variant="minimal"
          />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>
              {type === "products"
                ? t("analytics.top_products_caption")
                : type === "categories"
                  ? t("analytics.categories_caption")
                  : t("analytics.monthly_sales_caption")}
            </TableCaption>
            <TableHeader>
              {renderHeaders()}
            </TableHeader>
            <TableBody>
              {renderRows()}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
