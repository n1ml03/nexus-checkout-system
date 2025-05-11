import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useTranslation } from "react-i18next";
import { addDays, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-breakpoint";

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeSelector({ dateRange, onDateRangeChange, className }: DateRangeSelectorProps) {
  const { t } = useTranslation();
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const isMobile = useIsMobile();

  const presets = [
    {
      label: t("analytics.today"),
      value: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      label: t("analytics.yesterday"),
      value: {
        from: subDays(new Date(), 1),
        to: subDays(new Date(), 1),
      },
    },
    {
      label: t("analytics.last_7_days"),
      value: {
        from: subDays(new Date(), 6),
        to: new Date(),
      },
    },
    {
      label: t("analytics.last_30_days"),
      value: {
        from: subDays(new Date(), 29),
        to: new Date(),
      },
    },
    {
      label: t("analytics.this_month"),
      value: {
        from: startOfMonth(new Date()),
        to: new Date(),
      },
    },
    {
      label: t("analytics.last_month"),
      value: {
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      },
    },
    {
      label: t("analytics.this_year"),
      value: {
        from: startOfYear(new Date()),
        to: new Date(),
      },
    },
    {
      label: t("analytics.last_year"),
      value: {
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1)),
      },
    },
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    onDateRangeChange(preset.value);
    setSelectedPreset(preset.label);
  };

  // Common presets for quick access
  const quickPresets = presets.slice(0, 4);
  // All presets for dropdown
  const allPresets = presets;

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile layout - horizontal alignment */}
      {isMobile ? (
        <div className="flex flex-row items-center justify-between gap-2 w-full">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={onDateRangeChange}
            className="flex-1 min-w-0"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 whitespace-nowrap">
                {selectedPreset || t("analytics.period")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {allPresets.map((preset) => (
                <DropdownMenuItem
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        /* Desktop layout - more space for components */
        <div className="flex flex-row flex-wrap gap-2 items-center">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={onDateRangeChange}
            className="w-auto"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-auto">
                {selectedPreset || t("analytics.period")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {allPresets.map((preset) => (
                <DropdownMenuItem
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick access buttons for common time ranges (visible on larger screens) */}
          <div className="hidden md:flex flex-wrap gap-2">
            {quickPresets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="h-8 text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
