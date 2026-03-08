"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
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
import {
  createProfessional,
  updateProfessional,
} from "@/app/actions/professionals";

interface SpecialtyOption {
  id: string;
  name: string;
}

interface ProfessionalForEdit {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  specialtyId: string;
  licenseNumber: string;
  phone: string;
  email: string | null;
  color: string;
}

interface ProfessionalFormDialogProps {
  mode: "create" | "edit";
  professional?: ProfessionalForEdit;
  specialties: SpecialtyOption[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfessionalFormDialog({
  mode,
  professional,
  specialties,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProfessionalFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [specialtyId, setSpecialtyId] = useState(
    professional?.specialtyId ?? ""
  );

  async function handleSubmit(formData: FormData) {
    formData.set("specialtyId", specialtyId);

    if (mode === "create") {
      const result = await createProfessional(formData);
      if (result?.success) {
        toast.success("Profesional registrado correctamente");
        setOpen(false);
      } else if (result?.error) {
        toast.error(result.error);
      }
    } else if (professional) {
      const result = await updateProfessional(professional.id, formData);
      if (result?.success) {
        toast.success("Profesional actualizado correctamente");
        setOpen(false);
      } else if (result?.error) {
        toast.error(result.error);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger render={<Button />}>
          <Stethoscope className="mr-2 h-4 w-4" />
          Agregar Profesional
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Agregar Profesional"
              : "Editar Profesional"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Complete los datos del profesional."
              : "Modifique los datos del profesional."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pro-firstName">Nombre *</Label>
              <Input
                id="pro-firstName"
                name="firstName"
                required
                defaultValue={professional?.firstName ?? ""}
                placeholder="Maria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pro-lastName">Apellido *</Label>
              <Input
                id="pro-lastName"
                name="lastName"
                required
                defaultValue={professional?.lastName ?? ""}
                placeholder="Garcia"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pro-dni">DNI *</Label>
              <Input
                id="pro-dni"
                name="dni"
                required
                defaultValue={professional?.dni ?? ""}
                placeholder="12345678"
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidad *</Label>
              <Select
                value={specialtyId}
                onValueChange={(val) => { if (val) setSpecialtyId(val); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pro-licenseNumber">Matricula *</Label>
              <Input
                id="pro-licenseNumber"
                name="licenseNumber"
                required
                defaultValue={professional?.licenseNumber ?? ""}
                placeholder="MP-12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pro-phone">Telefono *</Label>
              <Input
                id="pro-phone"
                name="phone"
                required
                defaultValue={professional?.phone ?? ""}
                placeholder="011-1234-5678"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pro-email">Email</Label>
            <Input
              id="pro-email"
              name="email"
              defaultValue={professional?.email ?? ""}
              placeholder="profesional@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pro-color">Color identificatorio *</Label>
            <div className="flex items-center gap-3">
              <Input
                id="pro-color"
                name="color"
                type="color"
                required
                defaultValue={professional?.color ?? "#3b82f6"}
                className="h-10 w-16 cursor-pointer p-1"
              />
              <span className="text-sm text-muted-foreground">
                Se usara para identificar al profesional en la agenda
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {mode === "create" ? "Registrar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
