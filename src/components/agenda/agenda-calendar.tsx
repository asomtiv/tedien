"use client";

import { useRouter } from "next/navigation";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";
import type { DayButton } from "react-day-picker";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AgendaCalendarProps {
  selectedDate: string;
  appointmentDates: Date[];
}

export function AgendaCalendar({ selectedDate, appointmentDates }: AgendaCalendarProps) {
  const router = useRouter();
  const selected = parseISO(selectedDate);

  function handleSelect(date: Date | undefined) {
    if (date) {
      router.replace(`/agenda?date=${format(date, "yyyy-MM-dd")}`);
    }
  }

  const hasAppointment = (date: Date) =>
    appointmentDates.some((d) => isSameDay(d, date));

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <Card className="h-fit shadow-sm rounded-xl">
      <CardContent className="p-5">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          locale={es}
          className="[--cell-size:--spacing(9)] w-full"
          classNames={{
            root: "w-full",
            day: cn(
              "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)"
            ),
          }}
          modifiers={{
            hasAppointment: appointmentDates,
            weekend: isWeekend,
          }}
          components={{
            DayButton: (props: React.ComponentProps<typeof DayButton>) => {
              const date: Date = props.day.date;
              const showDot = hasAppointment(date);
              const weekend = isWeekend(date);
              const isSelected =
                props.modifiers.selected &&
                !props.modifiers.range_start &&
                !props.modifiers.range_end &&
                !props.modifiers.range_middle;

              return (
                <div
                  className={cn(
                    "relative w-full h-full rounded-(--cell-radius)",
                    weekend &&
                      !isSelected &&
                      !props.modifiers.today &&
                      "bg-slate-50 dark:bg-slate-900/30"
                  )}
                >
                  <CalendarDayButton locale={es} {...props} />
                  {showDot && (
                    <span
                      className={cn(
                        "absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                        isSelected
                          ? "bg-primary-foreground/70"
                          : "bg-blue-500"
                      )}
                    />
                  )}
                </div>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
