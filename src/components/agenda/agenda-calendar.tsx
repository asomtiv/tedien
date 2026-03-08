"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

interface AgendaCalendarProps {
  selectedDate: string;
}

export function AgendaCalendar({ selectedDate }: AgendaCalendarProps) {
  const router = useRouter();
  const selected = parseISO(selectedDate);

  function handleSelect(date: Date | undefined) {
    if (date) {
      router.replace(`/agenda?date=${format(date, "yyyy-MM-dd")}`);
    }
  }

  return (
    <Card className="h-fit shadow-sm rounded-xl">
      <CardContent className="p-5">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          locale={es}
          className="[--cell-size:--spacing(9)] w-full"
          classNames={{ root: "w-full" }}
        />
      </CardContent>
    </Card>
  );
}
