import { format, startOfDay, endOfDay, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";
import { prisma } from "@/lib/prisma";
import { AgendaCalendar } from "@/components/agenda/agenda-calendar";
import { AppointmentsList } from "@/components/agenda/appointments-list";
import { AppointmentFormDialog } from "@/components/agenda/appointment-form-dialog";

export const dynamic = "force-dynamic";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate =
    params.date || format(new Date(), "yyyy-MM-dd");

  const dayStart = startOfDay(parseISO(selectedDate));
  const dayEnd = endOfDay(parseISO(selectedDate));

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
    },
    include: { patient: true },
    orderBy: { date: "asc" },
  });

  const formattedDate = format(parseISO(selectedDate), "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground capitalize">{formattedDate}</p>
        </div>
        <AppointmentFormDialog mode="create" defaultDate={selectedDate} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <AgendaCalendar selectedDate={selectedDate} />
        <AppointmentsList
          appointments={appointments}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
