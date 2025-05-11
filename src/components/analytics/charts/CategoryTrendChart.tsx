import { useTranslation } from "react-i18next";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { CategoryDataPoint } from "@/types";

interface CategoryTrendChartProps {
  data: CategoryDataPoint[];
}

const CategoryTrendChart = ({ data }: CategoryTrendChartProps) => {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart outerRadius={90} data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="name" stroke="var(--muted-foreground)" />
        <PolarRadiusAxis stroke="var(--muted-foreground)" />
        <Radar
          name={t("analytics.sales")}
          dataKey="value"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.5}
          animationDuration={1500}
          animationEasing="ease-out"
        />
        <Tooltip
          formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, t("analytics.sales")]}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default CategoryTrendChart;
