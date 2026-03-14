"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updatePatient, deletePatient } from "@/app/actions/patients";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ProvinceOption {
  id: string;
  name: string;
}

interface SocialInsuranceOption {
  id: string;
  name: string;
}

interface PatientWithRelations {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  address: string | null;
  locality: string | null;
  birthDate: Date | null;
  provinceId: string | null;
  province: ProvinceOption | null;
  socialInsuranceId: string | null;
  socialInsurance: SocialInsuranceOption | null;
}

interface PatientsTableProps {
  patients: PatientWithRelations[];
  provinces: ProvinceOption[];
  socialInsurances: SocialInsuranceOption[];
}

function calcAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function formatBirthDate(birthDate: Date | null): string {
  if (!birthDate) return "";
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toDateInputValue(birthDate: Date | null): string {
  if (!birthDate) return "";
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calcAgeFromStr(str: string): number | null {
  if (!str) return null;
  const birth = new Date(str);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export function RecentPatientsTable({ patients, provinces, socialInsurances }: PatientsTableProps) {
  const [editingPatient, setEditingPatient] = useState<PatientWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editProvinceId, setEditProvinceId] = useState("");
  const [editSocialInsuranceId, setEditSocialInsuranceId] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");

  function openEdit(patient: PatientWithRelations) {
    setEditingPatient(patient);
    setEditProvinceId(patient.provinceId ?? "");
    setEditSocialInsuranceId(patient.socialInsuranceId ?? "");
    setEditBirthDate(toDateInputValue(patient.birthDate));
  }

  function closeEdit() {
    setEditingPatient(null);
    setEditProvinceId("");
    setEditSocialInsuranceId("");
    setEditBirthDate("");
  }

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deletePatient(deletingId);
    if (result.success) {
      toast.success("Paciente eliminado correctamente");
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingPatient) return;
    formData.set("provinceId", editProvinceId);
    formData.set("socialInsuranceId", editSocialInsuranceId);
    const result = await updatePatient(editingPatient.id, formData);
    if (result?.success) {
      toast.success("Paciente actualizado correctamente");
      closeEdit();
    } else if (result?.error) {
      toast.error(result.error);
    }
  }

  const editAge = calcAgeFromStr(editBirthDate);

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Domicilio</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Obra Social</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay pacientes registrados
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => {
                const age = calcAge(patient.birthDate);
                const birthStr = formatBirthDate(patient.birthDate);
                const domicilio = [patient.address, patient.locality, patient.province?.name]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.lastName}, {patient.firstName}
                    </TableCell>
                    <TableCell>{patient.dni}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {age !== null ? (
                        <span>
                          <span className="font-medium">{age}</span>
                          {birthStr && (
                            <span className="text-muted-foreground text-xs ml-1">({birthStr})</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {domicilio || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>{patient.phone ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      {patient.socialInsurance ? (
                        <Badge variant="secondary">{patient.socialInsurance.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {patient.notes ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(patient)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingId(patient.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null); }}
        title="Eliminar paciente"
        description="¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
      />

      <Dialog
        open={!!editingPatient}
        onOpenChange={(open) => { if (!open) closeEdit(); }}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Modifique los datos del paciente.
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <form action={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Nombre *</Label>
                  <Input id="edit-firstName" name="firstName" required defaultValue={editingPatient.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Apellido *</Label>
                  <Input id="edit-lastName" name="lastName" required defaultValue={editingPatient.lastName} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dni">DNI *</Label>
                <Input id="edit-dni" name="dni" required defaultValue={editingPatient.dni} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="edit-birthDate"
                    name="birthDate"
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end pb-1">
                  {editAge !== null && (
                    <p className="text-sm text-muted-foreground">
                      <span className="text-foreground font-medium">{editAge}</span> años
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Domicilio</Label>
                <Input id="edit-address" name="address" defaultValue={editingPatient.address ?? ""} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-locality">Localidad</Label>
                  <Input id="edit-locality" name="locality" defaultValue={editingPatient.locality ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Select value={editProvinceId} onValueChange={(val) => { if (val) setEditProvinceId(val); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar">
                        {provinces.find((p) => p.id === editProvinceId)?.name}
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
                <Label htmlFor="edit-phone">Telefono</Label>
                <Input id="edit-phone" name="phone" defaultValue={editingPatient.phone ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={editingPatient.email ?? ""} />
              </div>

              <div className="space-y-2">
                <Label>Obra Social</Label>
                <Select
                  value={editSocialInsuranceId || "__none__"}
                  onValueChange={(val) => setEditSocialInsuranceId(val === "__none__" ? "" : (val ?? ""))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin obra social">
                      {editSocialInsuranceId
                        ? socialInsurances.find((s) => s.id === editSocialInsuranceId)?.name
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
                <Label htmlFor="edit-notes">Notas</Label>
                <Input id="edit-notes" name="notes" defaultValue={editingPatient.notes ?? ""} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
