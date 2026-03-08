"use client";

import { format } from "date-fns";
import { toast } from "sonner";
import { Clock, Trash2, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentFormDialog } from "@/components/agenda/appointment-form-dialog";
import { deleteAppointment } from "@/app/actions/appointments";
import { cn } from "@/lib/utils";

interface AppointmentWithPatient {
  id: string;
  date: Date;
  reason: string;
  status: string;
  patientId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completado: {
    label: "Completado",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

interface AppointmentsListProps {
  appointments: AppointmentWithPatient[];
  selectedDate: string;
}

export function AppointmentsList({
  appointments,
  selectedDate,
}: AppointmentsListProps) {
  async function handleDelete(id: string) {
    if (!confirm("¿Está seguro de que desea eliminar este turno?")) return;

    const result = await deleteAppointment(id);
    if (result.success) {
      toast.success("Turno eliminado correctamente");
    }
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-sm">
        <CalendarX className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">
          No hay turnos para este dia
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Seleccione otra fecha o agende un nuevo turno
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => {
        const config = statusConfig[appointment.status] ?? statusConfig.pendiente;
        const appointmentDate = new Date(appointment.date);

        return (
          <div
            key={appointment.id}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-lg font-semibold tabular-nums">
                {format(appointmentDate, "HH:mm")}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">
                {appointment.patient.lastName}, {appointment.patient.firstName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {appointment.reason}
              </p>
            </div>

            <Badge
              variant="outline"
              className={cn("border-transparent shrink-0", config.className)}
            >
              {config.label}
            </Badge>

            <div className="flex items-center gap-1 shrink-0">
              <AppointmentFormDialog
                mode="edit"
                appointment={appointment}
                defaultDate={selectedDate}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(appointment.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
