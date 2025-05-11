import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";
import { RevenueDataPoint } from "@/types";
import { ChartType } from "@/components/analytics/ChartTypeSelector";

interface RevenueChartProps {
  data: RevenueDataPoint[];
  chartType: ChartType;
}

const RevenueChart = ({ data, chartType }: RevenueChartProps) => {
  const { t } = useTranslation();
  
  // Get the current year and previous year for the charts
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === "bar" ? (
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="prevYearGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="currYearGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
          <YAxis
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          />
          <Tooltip
            formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, t("analytics.revenue")]}
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
            dataKey={previousYear.toString()}
            fill="url(#prevYearGradient)"
            name={previousYear.toString()}
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1000}
            animationEasing="ease-out"
          />
          <Bar
            dataKey={currentYear.toString()}
            fill="url(#currYearGradient)"
            name={currentYear.toString()}
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </BarChart>
      ) : (
        <LineChart
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
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          />
          <Tooltip
            formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, t("analytics.revenue")]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={previousYear.toString()}
            stroke="#3b82f6"
            name={previousYear.toString()}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey={currentYear.toString()}
            stroke="#8b5cf6"
            name={currentYear.toString()}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default RevenueChart;
