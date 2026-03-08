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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePatient, deletePatient } from "@/app/actions/patients";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Patient } from "@/generated/prisma/client";

interface PatientsTableProps {
  patients: Patient[];
}

export function RecentPatientsTable({ patients }: PatientsTableProps) {
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deletePatient(deletingId);
    if (result.success) {
      toast.success("Paciente eliminado correctamente");
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingPatient) return;

    const result = await updatePatient(editingPatient.id, formData);
    if (result?.success) {
      toast.success("Paciente actualizado correctamente");
      setEditingPatient(null);
    } else if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No hay pacientes registrados
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.firstName}
                  </TableCell>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>{patient.dni}</TableCell>
                  <TableCell>{patient.phone ?? "—"}</TableCell>
                  <TableCell>{patient.email ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {patient.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingPatient(patient)}
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
              ))
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
        onOpenChange={(open) => {
          if (!open) setEditingPatient(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
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
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    required
                    defaultValue={editingPatient.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Apellido *</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    required
                    defaultValue={editingPatient.lastName}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dni">DNI *</Label>
                <Input
                  id="edit-dni"
                  name="dni"
                  required
                  defaultValue={editingPatient.dni}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefono</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  defaultValue={editingPatient.phone ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingPatient.email ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Input
                  id="edit-notes"
                  name="notes"
                  defaultValue={editingPatient.notes ?? ""}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPatient(null)}
                >
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
