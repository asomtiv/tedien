import { format, startOfDay, endOfDay, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";
import { prisma } from "@/lib/prisma";
import { AgendaCalendar } from "@/components/agenda/agenda-calendar";
import { AppointmentsList } from "@/components/agenda/appointments-list";
import { AppointmentFormDialog } from "@/components/agenda/appointment-form-dialog";
import { ProfessionalFilter } from "@/components/agenda/professional-filter";

export const dynamic = "force-dynamic";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; professional?: string; specialty?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date || format(new Date(), "yyyy-MM-dd");
  const selectedProfessional = params.professional || "all";
  const selectedSpecialty = params.specialty || "";

  const dayStart = startOfDay(parseISO(selectedDate));
  const dayEnd = endOfDay(parseISO(selectedDate));

  const whereClause: Record<string, unknown> = {
    date: { gte: dayStart, lte: dayEnd },
  };
  if (selectedProfessional !== "all") {
    whereClause.professionalId = selectedProfessional;
  } else if (selectedSpecialty) {
    whereClause.professional = { specialtyId: selectedSpecialty };
  }

  const [appointments, professionals] = await Promise.all([
    prisma.appointment.findMany({
      where: whereClause,
      include: { patient: true, professional: { include: { specialty: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.professional.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: { select: { id: true, name: true } },
        color: true,
      },
      orderBy: { lastName: "asc" },
    }),
  ]);

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
        <div className="flex items-center gap-3">
          <ProfessionalFilter
            professionals={professionals}
            selectedProfessional={selectedProfessional}
            selectedSpecialty={selectedSpecialty}
          />
          <AppointmentFormDialog
            mode="create"
            defaultDate={selectedDate}
            professionals={professionals}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_3fr]">
        <AgendaCalendar selectedDate={selectedDate} />
        <AppointmentsList
          appointments={appointments}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
