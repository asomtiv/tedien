export const dynamic = "force-dynamic";

import { Calendar, Users, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/dashboard/metric-card";

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [appointmentsToday, totalPatients, pendingAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.patient.count(),
      prisma.appointment.count({
        where: { status: "pendiente" },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
        Reportes generales
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Citas Hoy" value={appointmentsToday} icon={Calendar} />
        <MetricCard title="Pacientes Totales" value={totalPatients} icon={Users} />
        <MetricCard
          title="Consultas Pendientes"
          value={pendingAppointments}
          icon={Clock}
        />
      </div>
    </div>
  );
}
