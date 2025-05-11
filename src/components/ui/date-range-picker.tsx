"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { vi, enUS } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "@/hooks/use-breakpoint"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const { t, i18n } = useTranslation()
  const isMobile = useIsMobile()

  // Set locale based on current language
  const locale = i18n.language === 'vi' ? vi : enUS

  // Format date for display, with shorter format on mobile
  const formatDateDisplay = () => {
    if (!date?.from) return <span>{t("analytics.date_range")}</span>;

    if (isMobile) {
      // Shorter format for mobile
      if (date.to) {
        return (
          <>
            {format(date.from, "MM/dd", { locale })} - {format(date.to, "MM/dd", { locale })}
          </>
        );
      }
      return format(date.from, "MM/dd", { locale });
    } else {
      // Full format for desktop
      if (date.to) {
        return (
          <>
            {format(date.from, "LLL dd, y", { locale })} - {format(date.to, "LLL dd, y", { locale })}
          </>
        );
      }
      return format(date.from, "LLL dd, y", { locale });
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              isMobile
                ? "w-full justify-start text-left font-normal text-sm"
                : "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDateDisplay()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={isMobile ? 1 : 2}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
