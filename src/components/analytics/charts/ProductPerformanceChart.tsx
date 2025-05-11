import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ProductSalesDataPoint } from "@/types";

interface ProductPerformanceChartProps {
  data: ProductSalesDataPoint[];
}

const ProductPerformanceChart = ({ data }: ProductPerformanceChartProps) => {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" stroke="var(--muted-foreground)" />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#3b82f6"
          tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#8b5cf6"
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === "sales") {
              return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, t("analytics.sales")];
            }
            return [value.toLocaleString(), t("product.quantity")];
          }}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="sales"
          fill="#3b82f6"
          name={t("analytics.sales")}
          radius={[4, 4, 0, 0]}
          barSize={20}
          animationDuration={1000}
          animationEasing="ease-out"
        />
        <Bar
          yAxisId="right"
          dataKey="quantity"
          fill="#8b5cf6"
          name={t("product.quantity")}
          radius={[4, 4, 0, 0]}
          barSize={20}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductPerformanceChart;
