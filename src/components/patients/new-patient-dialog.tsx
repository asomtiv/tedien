"use client";

import { useState } from "react";
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
import { createPatient } from "@/app/actions/patients";
import { UserPlus } from "lucide-react";

interface ProvinceOption {
  id: string;
  name: string;
}

interface SocialInsuranceOption {
  id: string;
  name: string;
}

interface NewPatientDialogProps {
  provinces: ProvinceOption[];
  socialInsurances: SocialInsuranceOption[];
}

function calcAge(birthDateStr: string): number | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export function NewPatientDialog({ provinces, socialInsurances }: NewPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [provinceId, setProvinceId] = useState("");
  const [socialInsuranceId, setSocialInsuranceId] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const age = calcAge(birthDate);

  function resetForm() {
    setProvinceId("");
    setSocialInsuranceId("");
    setBirthDate("");
  }

  async function handleSubmit(formData: FormData) {
    formData.set("provinceId", provinceId);
    formData.set("socialInsuranceId", socialInsuranceId);
    const result = await createPatient(formData);
    if (result?.success) {
      resetForm();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="mr-2 h-4 w-4" />
        Nuevo Paciente
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
          <DialogDescription>
            Complete los datos del paciente para registrarlo en el sistema.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input id="firstName" name="firstName" required placeholder="Juan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input id="lastName" name="lastName" required placeholder="Perez" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI *</Label>
            <Input id="dni" name="dni" required placeholder="12345678" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="flex items-end pb-1">
              {age !== null && (
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{age}</span> años
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Domicilio</Label>
            <Input id="address" name="address" placeholder="Av. Corrientes 1234" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locality">Localidad</Label>
              <Input id="locality" name="locality" placeholder="Ej: Palermo" />
            </div>
            <div className="space-y-2">
              <Label>Provincia</Label>
              <Select value={provinceId} onValueChange={(val) => { if (val) setProvinceId(val); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar">
                    {provinces.find((p) => p.id === provinceId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" name="phone" placeholder="011-1234-5678" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="paciente@email.com" />
          </div>

          <div className="space-y-2">
            <Label>Obra Social</Label>
            <Select
              value={socialInsuranceId || "__none__"}
              onValueChange={(val) => setSocialInsuranceId(val === "__none__" ? "" : (val ?? ""))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin obra social">
                  {socialInsuranceId
                    ? socialInsurances.find((s) => s.id === socialInsuranceId)?.name
                    : "Sin obra social"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="__none__">Sin obra social</SelectItem>
                {socialInsurances.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Input id="notes" name="notes" placeholder="Observaciones..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
