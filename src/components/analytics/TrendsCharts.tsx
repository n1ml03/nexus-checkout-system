import { lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { BarChart2, ShoppingCart, PieChart as PieChartIcon } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import ChartSkeleton from "@/components/ui/chart-skeleton";
import MetricTooltip from "@/components/ui/metric-tooltip";
import { AnalyticsData } from "@/types";

// Lazy load chart components to reduce initial bundle size
// Use webpackChunkName to ensure proper code splitting
const SalesTrendChart = lazy(() =>
  import(/* webpackChunkName: "chart-sales-trend" */ './charts/SalesTrendChart')
);
const CategoryTrendChart = lazy(() =>
  import(/* webpackChunkName: "chart-category-trend" */ './charts/CategoryTrendChart')
);
const ProductPerformanceChart = lazy(() =>
  import(/* webpackChunkName: "chart-product-performance" */ './charts/ProductPerformanceChart')
);

interface TrendsChartsProps {
  data: AnalyticsData;
  isRefetching: boolean;
}

export function TrendsCharts({ data, isRefetching }: TrendsChartsProps) {
  const { t } = useTranslation();

  // Destructure the data for easier access
  const {
    salesData,
    categoryData,
    topProducts
  } = data || {
    salesData: [],
    categoryData: [],
    topProducts: []
  };

  // Loading fallback for lazy-loaded components
  const ChartLoadingFallback = ({ height = 300 }: { height?: number }) => {
    // Use smaller height on mobile
    const mobileHeight = height > 300 ? 280 : 220;

    return (
      <div style={{ height: `${height}px` }} className="flex items-center justify-center">
        <ChartSkeleton
          type="line"
          height={typeof window !== 'undefined' && window.innerWidth < 640 ? mobileHeight : height}
        />
      </div>
    );
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            <MetricTooltip
              content={t("analytics.sales_trend_tooltip", "Shows how sales have changed over time. Upward trends indicate growing sales.")}
              side="top"
            >
              {t("analytics.sales_trend")}
            </MetricTooltip>
          </CardTitle>
          <CardDescription>{t("analytics.monthly_trend")}</CardDescription>
        </CardHeader>
        <CardContent className="h-60 sm:h-80">
          {isRefetching ? (
            <ChartSkeleton type="line" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 300} />
          ) : salesData.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title={t("analytics.no_sales_data", "No sales data available")}
              description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
              size="md"
              variant="minimal"
            />
          ) : (
            <Suspense fallback={<ChartLoadingFallback />}>
              <SalesTrendChart data={salesData} />
            </Suspense>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <MetricTooltip
              content={t("analytics.category_trend_tooltip", "Shows the distribution of sales across different product categories.")}
              side="top"
            >
              {t("analytics.category_trend")}
            </MetricTooltip>
          </CardTitle>
          <CardDescription>{t("analytics.category_performance")}</CardDescription>
        </CardHeader>
        <CardContent className="h-60 sm:h-80">
          {isRefetching ? (
            <ChartSkeleton type="pie" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 300} />
          ) : categoryData.length === 0 ? (
            <EmptyState
              icon={PieChartIcon}
              title={t("analytics.no_category_data", "No category data available")}
              description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
              size="md"
              variant="minimal"
            />
          ) : (
            <Suspense fallback={<ChartLoadingFallback />}>
              <CategoryTrendChart data={categoryData} />
            </Suspense>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>
            <MetricTooltip
              content={t("analytics.product_performance_tooltip", "Compares sales revenue and quantity sold for top products.")}
              side="top"
            >
              {t("analytics.product_performance")}
            </MetricTooltip>
          </CardTitle>
          <CardDescription>{t("analytics.top_products_comparison")}</CardDescription>
        </CardHeader>
        <CardContent className="h-60 sm:h-80">
          {isRefetching ? (
            <ChartSkeleton type="bar" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 300} />
          ) : topProducts.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title={t("analytics.no_product_data", "No product data available")}
              description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
              size="md"
              variant="minimal"
            />
          ) : (
            <Suspense fallback={<ChartLoadingFallback />}>
              <ProductPerformanceChart data={topProducts.slice(0, 5)} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TrendsCharts;
