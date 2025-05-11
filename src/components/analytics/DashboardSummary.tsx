import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "@/types";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, CreditCard } from "lucide-react";
import MetricTooltip from "@/components/ui/metric-tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSummaryProps {
  data: AnalyticsData;
  isLoading?: boolean;
}

export function DashboardSummary({ data, isLoading = false }: DashboardSummaryProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      title: t("analytics.total_sales"),
      value: `$${data.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: data.salesGrowth,
      icon: DollarSign,
      tooltip: t("analytics.total_sales_tooltip", "Total revenue from all completed orders in the selected period."),
    },
    {
      title: t("analytics.customers"),
      value: data.activeCustomers.toLocaleString(),
      change: data.customerGrowth,
      icon: Users,
      tooltip: t("analytics.customers_tooltip", "Number of unique customers who made a purchase in the selected period."),
    },
    {
      title: t("analytics.conversion"),
      value: `${data.conversionRate}%`,
      change: data.conversionGrowth,
      icon: ShoppingCart,
      tooltip: t("analytics.conversion_tooltip", "Percentage of visitors who completed a purchase. Higher is better."),
    },
    {
      title: t("analytics.avg_order"),
      value: `$${(data.avgOrderValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: 0, // We don't have this data yet
      icon: CreditCard,
      tooltip: t("analytics.avg_order_tooltip", "Average value of each order. Higher values indicate customers are spending more per transaction."),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If all metrics are zero, show empty state
  const hasData = metrics.some(metric =>
    typeof metric.value === 'string'
      ? parseFloat(metric.value.replace(/[^0-9.-]+/g, "")) > 0
      : metric.value > 0
  );

  if (!hasData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="opacity-70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <MetricTooltip
                content={metric.tooltip}
                side="top"
              >
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
              </MetricTooltip>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {t("analytics.no_data_period")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <MetricTooltip
              content={metric.tooltip}
              side="top"
            >
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
            </MetricTooltip>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {metric.change > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">+{metric.change}%</span>
                </>
              ) : metric.change < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-rose-500" />
                  <span className="text-rose-500">{metric.change}%</span>
                </>
              ) : (
                <span>0%</span>
              )}
              {" "}{t("analytics.monthly")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
