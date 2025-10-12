"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  maxYearIsCurrent?: boolean;
};

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  maxYearIsCurrent = true,
  ...props
}: EnhancedCalendarProps) {
  // Default to a reasonable birth year (1980) if no date is selected
  const getDefaultDate = () => {
    if (props.selected instanceof Date) {
      return props.selected;
    }
    // Default to January 1, 1980 for birth date selection
    return new Date(1980, 0, 1);
  };

  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    getDefaultDate()
  );

  // Generate years from 1900 to current year (or beyond if maxYearIsCurrent is false)
  const currentYear = new Date().getFullYear();
  const maxYear = maxYearIsCurrent ? currentYear : currentYear + 10; // Allow 10 years in the future if not restricted
  const years = Array.from(
    { length: maxYear - 1900 + 1 },
    (_, i) => 1900 + i
  ).reverse();

  // Generate months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(months.indexOf(month));
    setCurrentMonth(newDate);
  };

  // Update current month when selected date changes
  React.useEffect(() => {
    if (
      props.selected instanceof Date &&
      props.selected.getTime() !== currentMonth.getTime()
    ) {
      setCurrentMonth(props.selected);
    }
  }, [props.selected]);

  return (
    <div className="space-y-4">
      {/* Quick Decades Selection */}
      {/* <div className="flex gap-1 justify-center flex-wrap">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(1990, 0, 1))}
          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
        >
          90s
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(1980, 0, 1))}
          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
        >
          80s
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(1970, 0, 1))}
          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
        >
          70s
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(1960, 0, 1))}
          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
        >
          60s
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(1950, 0, 1))}
          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
        >
          50s
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(1940, 0, 1))}
          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
        >
          40s
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(1930, 0, 1))}
          className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
        >
          30s
        </button>
      </div> */}

      {/* Year and Month Selectors */}
      <div className="flex gap-2 justify-center">
        <Select
          value={months[currentMonth.getMonth()]}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentMonth.getFullYear().toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar */}
      <DayPicker
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("h-4 w-4", className)} {...props} />
          ),
        }}
        {...props}
      />
    </div>
  );
}
EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };
