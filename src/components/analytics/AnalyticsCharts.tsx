import { lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BarChart2, ShoppingCart, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import EmptyState from "@/components/ui/empty-state";
import ChartSkeleton from "@/components/ui/chart-skeleton";
import { ChartTypeSelector, type ChartType } from "@/components/analytics/ChartTypeSelector";
import { AnalyticsData } from "@/types";

// Lazy load chart components to reduce initial bundle size
// Use webpackChunkName to ensure proper code splitting
const SalesChart = lazy(() =>
  import(/* webpackChunkName: "chart-sales" */ './charts/SalesChart')
);
const CategoryChart = lazy(() =>
  import(/* webpackChunkName: "chart-category" */ './charts/CategoryChart')
);
const TopProductsChart = lazy(() =>
  import(/* webpackChunkName: "chart-top-products" */ './charts/TopProductsChart')
);
const TopQuantityChart = lazy(() =>
  import(/* webpackChunkName: "chart-top-quantity" */ './charts/TopQuantityChart')
);
const RevenueChart = lazy(() =>
  import(/* webpackChunkName: "chart-revenue" */ './charts/RevenueChart')
);

interface AnalyticsChartsProps {
  data: AnalyticsData;
  isRefetching: boolean;
  expandedCards: Record<string, boolean>;
  chartType: Record<string, ChartType>;
  toggleCardExpansion: (cardId: string) => void;
  handleChartTypeChange: (chartId: string, type: ChartType) => void;
}

export function AnalyticsCharts({
  data,
  isRefetching,
  expandedCards,
  chartType,
  toggleCardExpansion,
  handleChartTypeChange
}: AnalyticsChartsProps) {
  const { t } = useTranslation();

  // Destructure the data for easier access
  const {
    salesData,
    categoryData,
    revenueData,
    topProducts
  } = data || {
    salesData: [],
    categoryData: [],
    revenueData: [],
    topProducts: []
  };

  // Loading fallback for lazy-loaded components
  const ChartLoadingFallback = ({ height = 300 }: { height?: number }) => {
    // Use smaller height on mobile
    const mobileHeight = height > 300 ? 280 : 220;

    return (
      <div style={{ height: `${height}px` }} className="flex items-center justify-center">
        <ChartSkeleton
          type="area"
          height={typeof window !== 'undefined' && window.innerWidth < 640 ? mobileHeight : height}
        />
      </div>
    );
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
      <Card className="col-span-1 md:col-span-2">
        <Collapsible open={expandedCards.sales} onOpenChange={() => toggleCardExpansion("sales")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center">
                {t("analytics.sales")}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                    {expandedCards.sales ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </CardTitle>
              <CardDescription>
                {t("analytics.monthly")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ChartTypeSelector
                value={chartType.sales}
                onChange={(type) => handleChartTypeChange("sales", type)}
                allowedTypes={["area", "line", "bar"]}
              />
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="h-60 sm:h-80">
                {isRefetching ? (
                  <ChartSkeleton
                    type={chartType.sales === "area" ? "area" : chartType.sales === "line" ? "line" : "bar"}
                    height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 300}
                  />
                ) : salesData.length > 0 ? (
                  <Suspense fallback={<ChartLoadingFallback />}>
                    <SalesChart
                      data={salesData}
                      chartType={chartType.sales}
                    />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={BarChart2}
                    title={t("analytics.no_sales_data", "No sales data available")}
                    description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
                    size="md"
                    variant="minimal"
                  />
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="h-full">
        <Collapsible open={expandedCards.category} onOpenChange={() => toggleCardExpansion("category")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center">
                {t("analytics.category_distribution")}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                    {expandedCards.category ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </CardTitle>
              <CardDescription>
                {t("analytics.by_category")}
              </CardDescription>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="h-60 sm:h-80">
                {isRefetching ? (
                  <ChartSkeleton type="pie" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 300} />
                ) : categoryData.length > 0 ? (
                  <Suspense fallback={<ChartLoadingFallback />}>
                    <CategoryChart data={categoryData} />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={PieChartIcon}
                    title={t("analytics.no_category_data", "No category data available")}
                    description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
                    size="md"
                    variant="minimal"
                  />
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="col-span-1 md:col-span-2 xl:col-span-2">
        <Collapsible open={expandedCards.topProducts} onOpenChange={() => toggleCardExpansion("topProducts")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center">
                {t("analytics.top_products")}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                    {expandedCards.topProducts ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </CardTitle>
              <CardDescription>
                {t("analytics.by_revenue")}
              </CardDescription>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="h-60 sm:h-80">
                {isRefetching ? (
                  <ChartSkeleton type="bar" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 300} />
                ) : topProducts.length > 0 ? (
                  <Suspense fallback={<ChartLoadingFallback />}>
                    <TopProductsChart data={topProducts.slice(0, 5)} />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={ShoppingCart}
                    title={t("analytics.no_product_data", "No product data available")}
                    description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
                    size="md"
                    variant="minimal"
                  />
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="col-span-1 md:col-span-2 xl:col-span-1">
        <Collapsible open={expandedCards.topQuantity} onOpenChange={() => toggleCardExpansion("topQuantity")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center">
                {t("analytics.top_products")}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                    {expandedCards.topQuantity ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </CardTitle>
              <CardDescription>
                {t("analytics.by_quantity")}
              </CardDescription>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="h-60 sm:h-80">
                {isRefetching ? (
                  <ChartSkeleton type="bar" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 220 : 300} />
                ) : topProducts.length > 0 ? (
                  <Suspense fallback={<ChartLoadingFallback />}>
                    <TopQuantityChart data={topProducts.slice(0, 5)} />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={ShoppingCart}
                    title={t("analytics.no_product_data", "No product data available")}
                    description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
                    size="md"
                    variant="minimal"
                  />
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="col-span-1 md:col-span-full">
        <Collapsible open={expandedCards.revenue} onOpenChange={() => toggleCardExpansion("revenue")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center">
                {t("analytics.revenue_comparison")}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                    {expandedCards.revenue ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </CardTitle>
              <CardDescription>
                {t("analytics.year_over_year")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ChartTypeSelector
                value={chartType.revenue}
                onChange={(type) => handleChartTypeChange("revenue", type)}
                allowedTypes={["bar", "line"]}
              />
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="h-72 sm:h-96">
                {isRefetching ? (
                  <ChartSkeleton type={chartType.revenue === "bar" ? "bar" : "line"} height={typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 380} />
                ) : revenueData.length > 0 ? (
                  <Suspense fallback={<ChartLoadingFallback height={typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 380} />}>
                    <RevenueChart
                      data={revenueData}
                      chartType={chartType.revenue}
                    />
                  </Suspense>
                ) : (
                  <EmptyState
                    icon={LineChartIcon}
                    title={t("analytics.no_revenue_data", "No revenue comparison data available")}
                    description={t("analytics.empty_data_description", "Data will appear here once sales are recorded")}
                    size="md"
                    variant="minimal"
                  />
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

export default AnalyticsCharts;
