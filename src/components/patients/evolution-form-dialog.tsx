"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Plus, X } from "lucide-react";
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
import { getAvailableProducts } from "@/app/actions/inventory";

type UnlinkedAppointment = Awaited<ReturnType<typeof getUnlinkedAppointments>>[number];
type ProfessionalOption = Awaited<ReturnType<typeof getAllProfessionals>>[number];
type ProductOption = Awaited<ReturnType<typeof getAvailableProducts>>[number];

interface SelectedInsumo {
  productId: string;
  quantity: number;
}

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
  const [products, setProducts] = useState<ProductOption[]>([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [treatment, setTreatment] = useState("");
  const [tooth, setTooth] = useState("");
  const [face, setFace] = useState("");
  const [description, setDescription] = useState("");
  const [selectedInsumos, setSelectedInsumos] = useState<SelectedInsumo[]>([]);

  useEffect(() => {
    if (open) {
      Promise.all([
        getUnlinkedAppointments(patientId),
        getAllProfessionals(),
        getAvailableProducts(),
      ]).then(([appts, pros, prods]) => {
        setAppointments(appts);
        setProfessionals(pros);
        setProducts(prods);
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
    setSelectedInsumos([]);
  }

  function addInsumo() {
    setSelectedInsumos((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeInsumo(index: number) {
    setSelectedInsumos((prev) => prev.filter((_, i) => i !== index));
  }

  function updateInsumo(index: number, field: keyof SelectedInsumo, value: string | number) {
    setSelectedInsumos((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  const selectedProductIds = new Set(selectedInsumos.map((i) => i.productId).filter(Boolean));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!appointmentId || !professionalId || !treatment || !face) {
      toast.error("Complete los campos obligatorios");
      return;
    }

    setLoading(true);

    const insumos = selectedInsumos.filter((i) => i.productId && i.quantity > 0);

    const result = await createEvolution({
      historyId,
      appointmentId,
      professionalId,
      treatment,
      description,
      tooth: tooth || undefined,
      face,
      insumos: insumos.length > 0 ? insumos : undefined,
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
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
                  <SelectValue placeholder="Seleccionar turno">
                    {(() => {
                      const appt = appointments.find((a) => a.id === appointmentId);
                      return appt
                        ? `${format(new Date(appt.date), "dd/MM/yyyy HH:mm", { locale: es })} — ${appt.reason} (Dr. ${appt.professional.lastName})`
                        : undefined;
                    })()}
                  </SelectValue>
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
                <SelectValue placeholder="Seleccionar profesional">
                  {(() => {
                    const pro = professionals.find((p) => p.id === professionalId);
                    return pro ? `${pro.lastName}, ${pro.firstName}` : undefined;
                  })()}
                </SelectValue>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Insumos Utilizados</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInsumo}
                disabled={products.length === 0}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Agregar
              </Button>
            </div>
            {selectedInsumos.map((insumo, index) => {
              const product = products.find((p) => p.id === insumo.productId);
              const availableProducts = products.filter(
                (p) => p.id === insumo.productId || !selectedProductIds.has(p.id)
              );
              return (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={insumo.productId}
                    onValueChange={(val) => {
                      if (val) updateInsumo(index, "productId", val);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar insumo">
                        {product ? `${product.name} (${product.stock} ${product.unit})` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.stock} {p.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    max={product?.stock ?? 1}
                    value={insumo.quantity}
                    onChange={(e) =>
                      updateInsumo(index, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeInsumo(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
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
