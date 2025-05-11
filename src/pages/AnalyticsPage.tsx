
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { subMonths } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  Printer,
  BarChart2,
  ShoppingCart,
  DollarSign,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardSummary } from "@/queries/useAnalytics";
import { DateRangeSelector } from "@/components/analytics/DateRangeSelector";
import { CategoryFilter } from "@/components/analytics/CategoryFilter";
import { DashboardSummary } from "@/components/analytics/DashboardSummary";
import { AnalyticsDataTable } from "@/components/analytics/AnalyticsDataTable";
import { ChartType } from "@/components/analytics/ChartTypeSelector";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";

// Lazy load the chart components to reduce initial bundle size
// Use webpackChunkName to ensure proper code splitting
const AnalyticsCharts = lazy(() =>
  import(/* webpackChunkName: "analytics-charts" */ "@/components/analytics/AnalyticsCharts")
);
const TrendsCharts = lazy(() =>
  import(/* webpackChunkName: "analytics-trends" */ "@/components/analytics/TrendsCharts")
);



const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  // Track the active tab for potential future use (e.g., analytics tracking)
  const [, setActiveTab] = useState("overview");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    sales: true,
    category: true,
    topProducts: true,
    topQuantity: true,
    revenue: true
  });
  const [chartType, setChartType] = useState<Record<string, ChartType>>({
    sales: "area",
    revenue: "bar",
    trends: "line",
    category: "pie",
    products: "bar"
  });


  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Handle chart type change
  const handleChartTypeChange = (chartId: string, type: ChartType) => {
    setChartType(prev => ({
      ...prev,
      [chartId]: type
    }));
  };

  // Use the dashboard summary query hook
  const { data: analyticsData, isLoading, error, refetch, isRefetching } = useDashboardSummary({
    refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  const { t } = useTranslation();

  // Get the data to display with fallback for undefined data
  const displayData = analyticsData || {
    totalSales: 0,
    salesGrowth: 0,
    activeCustomers: 0,
    customerGrowth: 0,
    conversionRate: 0,
    conversionGrowth: 0,
    avgOrderValue: 0,
    salesData: [],
    categoryData: [],
    revenueData: [],
    topProducts: []
  };

  // If there was an error, show an error message with retry button
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <EmptyState
          icon={AlertCircle}
          title={t("common.error")}
          description={t("analytics.error_description", "There was an error loading analytics data. Please try again.")}
          actionLabel={t("common.retry")}
          onAction={() => refetch()}
          size="lg"
          variant="default"
        />
      </div>
    );
  }



  // Convert dateRange to DateRange type for the DateRangeSelector
  const dateRangeForPicker = {
    from: dateRange.from,
    to: dateRange.to
  };

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    if (range.from && range.to) {
      setDateRange({
        from: range.from,
        to: range.to
      });
    }
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
    toast.success(t("analytics.data_refreshed"));
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in space-y-6 print:m-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.analytics")}</h1>
          <p className="text-muted-foreground">
            {t("analytics.overview")}
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 w-full md:w-auto">
          <CategoryFilter value={categoryFilter} onChange={handleCategoryChange} />

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefetching}
            title={t("analytics.refresh_data")}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handlePrint}
            title={t("analytics.print_report")}
            className="h-9 w-9"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="print:hidden mb-4">
        <DateRangeSelector
          dateRange={dateRangeForPicker}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>



      {isLoading ? (
        <LoadingState
          message={t("analytics.loading_data", "Loading analytics data...")}
          size="lg"
          fullPage={false}
          className="py-12"
        />
      ) : (
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-4 print:hidden">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t("analytics.overview")}</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t("analytics.products")}</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center justify-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t("analytics.sales")}</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center justify-center">
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t("analytics.trends")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardSummary data={displayData} isLoading={isRefetching} />

            <Suspense fallback={
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <AnalyticsCharts
                data={displayData}
                isRefetching={isRefetching}
                expandedCards={expandedCards}
                chartType={chartType}
                toggleCardExpansion={toggleCardExpansion}
                handleChartTypeChange={handleChartTypeChange}
              />
            </Suspense>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <AnalyticsDataTable data={displayData} type="products" isLoading={isRefetching} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AnalyticsDataTable data={displayData} type="sales" isLoading={isRefetching} />
            <AnalyticsDataTable data={displayData} type="categories" isLoading={isRefetching} />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
            <Suspense fallback={
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <TrendsCharts
                data={displayData}
                isRefetching={isRefetching}
              />
            </Suspense>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
};

export default AnalyticsPage;
