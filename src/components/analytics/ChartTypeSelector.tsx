import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { BarChart2, LineChart, PieChart, AreaChart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ChartType = 'bar' | 'line' | 'area' | 'pie';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  allowedTypes?: ChartType[];
}

/**
 * Component for selecting chart visualization type
 */
export function ChartTypeSelector({ 
  value, 
  onChange, 
  allowedTypes = ['bar', 'line', 'area', 'pie'] 
}: ChartTypeSelectorProps) {
  const { t } = useTranslation();

  // Chart type configurations
  const chartTypes: Record<ChartType, { icon: React.ElementType; label: string }> = {
    bar: { icon: BarChart2, label: t('analytics.bar_chart') },
    line: { icon: LineChart, label: t('analytics.line_chart') },
    area: { icon: AreaChart, label: t('analytics.area_chart') },
    pie: { icon: PieChart, label: t('analytics.pie_chart') }
  };

  // Get current chart type config
  const currentType = chartTypes[value];
  
  // Filter allowed chart types
  const availableTypes = Object.entries(chartTypes)
    .filter(([type]) => allowedTypes.includes(type as ChartType))
    .map(([type, config]) => ({ type: type as ChartType, ...config }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <currentType.icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableTypes.map(({ type, icon: Icon, label }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => onChange(type)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
