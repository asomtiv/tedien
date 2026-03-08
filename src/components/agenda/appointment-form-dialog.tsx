"use client";

import { useState, useEffect } from "react";
import { format, startOfToday } from "date-fns";
import { es } from "date-fns/locale/es";
import { toast } from "sonner";
import { CalendarPlus, Pencil, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientCombobox } from "@/components/agenda/patient-combobox";
import {
  createAppointment,
  updateAppointment,
} from "@/app/actions/appointments";
import { getAllProfessionals } from "@/app/actions/professionals";
import { cn } from "@/lib/utils";

interface AppointmentWithPatientAndProfessional {
  id: string;
  date: Date;
  reason: string;
  status: string;
  patientId: string;
  professionalId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
  };
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: { name: string };
    color: string;
  };
}

type ProfessionalOption = Awaited<ReturnType<typeof getAllProfessionals>>[number];

interface AppointmentFormDialogProps {
  mode: "create" | "edit";
  appointment?: AppointmentWithPatientAndProfessional;
  defaultDate?: string;
  professionals?: ProfessionalOption[];
}

export function AppointmentFormDialog({
  mode,
  appointment,
  defaultDate,
  professionals: initialProfessionals,
}: AppointmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>(
    initialProfessionals ?? []
  );
  const [patientId, setPatientId] = useState<string | null>(
    appointment?.patientId ?? null
  );
  const [professionalId, setProfessionalId] = useState<string>(
    appointment?.professionalId ?? ""
  );
  const [date, setDate] = useState<Date | undefined>(
    appointment ? new Date(appointment.date) : defaultDate ? new Date(defaultDate + "T00:00:00") : new Date()
  );
  const [time, setTime] = useState(
    appointment
      ? format(new Date(appointment.date), "HH:mm")
      : "09:00"
  );
  const [reason, setReason] = useState(appointment?.reason ?? "");
  const [status, setStatus] = useState(appointment?.status ?? "pendiente");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const initialLabel = appointment
    ? `${appointment.patient.lastName}, ${appointment.patient.firstName} — DNI: ${appointment.patient.dni}`
    : "";

  useEffect(() => {
    if (open && professionals.length === 0) {
      getAllProfessionals().then(setProfessionals);
    }
  }, [open, professionals.length]);

  function resetForm() {
    if (mode === "create") {
      setPatientId(null);
      setProfessionalId("");
      setDate(defaultDate ? new Date(defaultDate + "T00:00:00") : new Date());
      setTime("09:00");
      setReason("");
      setStatus("pendiente");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!patientId || !professionalId || !date || !time || !reason) {
      toast.error("Complete todos los campos obligatorios");
      return;
    }

    const dateStr = format(date, "yyyy-MM-dd");

    if (mode === "create") {
      const result = await createAppointment({
        patientId,
        professionalId,
        date: dateStr,
        time,
        reason,
        status,
      });
      if (result.success) {
        toast.success("Turno creado correctamente");
        resetForm();
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } else if (appointment) {
      const result = await updateAppointment(appointment.id, {
        patientId,
        professionalId,
        date: dateStr,
        time,
        reason,
        status,
      });
      if (result.success) {
        toast.success("Turno actualizado correctamente");
        setOpen(false);
      } else {
        toast.error("Error al actualizar el turno");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button />
          ) : (
            <Button variant="ghost" size="icon-sm" />
          )
        }
      >
        {mode === "create" ? (
          <>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nuevo Turno
          </>
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nuevo Turno" : "Editar Turno"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Complete los datos para agendar un nuevo turno."
              : "Modifique los datos del turno."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <PatientCombobox
              value={patientId}
              onChange={(id) => setPatientId(id)}
              initialLabel={initialLabel}
            />
          </div>

          <div className="space-y-2">
            <Label>Profesional *</Label>
            <Select value={professionalId} onValueChange={(val) => { if (val) setProfessionalId(val); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((pro) => (
                  <SelectItem key={pro.id} value={pro.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: pro.color }}
                      />
                      {pro.lastName}, {pro.firstName} — {pro.specialty.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger
                  render={<Button variant="outline" />}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Seleccionar"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setDatePickerOpen(false);
                    }}
                    locale={es}
                    disabled={{ before: startOfToday() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Control, Limpieza, Extraccion..."
              required
            />
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(val) => { if (val) setStatus(val); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {mode === "create" ? "Agendar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
