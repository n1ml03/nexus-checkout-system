import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { ProductSalesDataPoint } from "@/types";

interface TopQuantityChartProps {
  data: ProductSalesDataPoint[];
}

const TopQuantityChart = ({ data }: TopQuantityChartProps) => {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="topQuantityGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          stroke="var(--muted-foreground)"
          tickFormatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="var(--muted-foreground)"
          width={150}
          tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
        />
        <Tooltip
          formatter={(value) => [value.toLocaleString(), t("product.quantity")]}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        />
        <Bar
          dataKey="quantity"
          fill="url(#topQuantityGradient)"
          name={t("product.quantity")}
          radius={[0, 4, 4, 0]}
          barSize={30}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopQuantityChart;
