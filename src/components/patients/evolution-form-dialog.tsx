"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUnlinkedAppointments, createEvolution } from "@/app/actions/clinical-history";
import { getAllProfessionals } from "@/app/actions/professionals";

type UnlinkedAppointment = Awaited<ReturnType<typeof getUnlinkedAppointments>>[number];
type ProfessionalOption = Awaited<ReturnType<typeof getAllProfessionals>>[number];

interface EvolutionFormDialogProps {
  historyId: string;
  patientId: string;
}

export function EvolutionFormDialog({ historyId, patientId }: EvolutionFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<UnlinkedAppointment[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [treatment, setTreatment] = useState("");
  const [tooth, setTooth] = useState("");
  const [face, setFace] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      Promise.all([
        getUnlinkedAppointments(patientId),
        getAllProfessionals(),
      ]).then(([appts, pros]) => {
        setAppointments(appts);
        setProfessionals(pros);
      });
    }
  }, [open, patientId]);

  function handleAppointmentChange(value: string | null) {
    if (!value) return;
    setAppointmentId(value);
    const appt = appointments.find((a) => a.id === value);
    if (appt) {
      setProfessionalId(appt.professional.id);
    }
  }

  function resetForm() {
    setAppointmentId("");
    setProfessionalId("");
    setTreatment("");
    setTooth("");
    setFace("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!appointmentId || !professionalId || !treatment || !face) {
      toast.error("Complete los campos obligatorios");
      return;
    }

    setLoading(true);

    const result = await createEvolution({
      historyId,
      appointmentId,
      professionalId,
      treatment,
      description,
      tooth: tooth || undefined,
      face,
    });

    setLoading(false);

    if (result.success) {
      toast.success("Evolución registrada correctamente");
      resetForm();
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="icon-sm" />}>
        <Plus className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Evolución</DialogTitle>
          <DialogDescription>
            Registre la evolución clínica vinculada a un turno del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Turno *</Label>
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No hay turnos disponibles sin evolución registrada.
              </p>
            ) : (
              <Select value={appointmentId} onValueChange={handleAppointmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar turno" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((appt) => (
                    <SelectItem key={appt.id} value={appt.id}>
                      {format(new Date(appt.date), "dd/MM/yyyy HH:mm", { locale: es })}
                      {" — "}
                      {appt.reason}
                      {" (Dr. "}
                      {appt.professional.lastName}
                      {")"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Profesional *</Label>
            <Select
              value={professionalId}
              onValueChange={(val) => { if (val) setProfessionalId(val); }}
            >
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
                      {pro.lastName}, {pro.firstName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamiento *</Label>
            <Input
              id="treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Ej: Obturación, Endodoncia..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tooth">Pieza Dental</Label>
              <Input
                id="tooth"
                value={tooth}
                onChange={(e) => setTooth(e.target.value)}
                placeholder="Ej: 36, 14..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="face">Cara *</Label>
              <Input
                id="face"
                value={face}
                onChange={(e) => setFace(e.target.value)}
                placeholder="Ej: Oclusal, Vestibular..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notas</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle clínico de la evolución..."
              rows={3}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || appointments.length === 0}>
              {loading ? "Guardando..." : "Guardar Evolución"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
