"use client";

import { buttonVariants } from "@/components/ui/button";
import { isSameLocalYearMonth } from "@/lib/design/calendar-date";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  animate = false,
  navLayout = "around",
  weekStartsOn = 0,
  components,
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      {...props}
      showOutsideDays={showOutsideDays}
      animate={animate}
      navLayout={navLayout}
      weekStartsOn={weekStartsOn}
      month={month}
      onMonthChange={(next) => {
        if (month && isSameLocalYearMonth(month, next)) {
          return;
        }
        onMonthChange?.(next);
      }}
      className={cn("relative w-fit p-2 [--cell-size:2.5rem]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("flex flex-col", defaults.months),
        month: cn("flex w-full flex-col gap-3", defaults.month),
        month_caption: cn(
          "flex h-11 w-full items-center justify-center px-11 font-display text-base capitalize text-foreground",
          defaults.month_caption,
        ),
        nav: cn("absolute inset-x-0 top-0 flex items-center justify-between", defaults.nav),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          defaults.button_previous,
        ),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon" }), defaults.button_next),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "flex-1 select-none text-center text-muted-foreground text-xs",
          defaults.weekday,
        ),
        month_grid: cn("w-full", defaults.month_grid),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn("relative flex-1 p-0.5", defaults.day),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-11 w-full p-0 font-normal text-foreground",
          defaults.day_button,
        ),
        selected: cn("rounded-md bg-primary text-primary-foreground", defaults.selected),
        today: cn("text-primary", defaults.today),
        outside: cn("text-muted-foreground opacity-50", defaults.outside),
        disabled: cn("text-muted-foreground opacity-40", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", chevronClass)} {...chevronProps} />
          ) : (
            <ChevronRight className={cn("size-4", chevronClass)} {...chevronProps} />
          ),
        ...components,
      }}
    />
  );
}
