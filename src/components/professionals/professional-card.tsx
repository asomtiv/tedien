"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfessionalFormDialog } from "@/components/professionals/professional-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteProfessional } from "@/app/actions/professionals";
import type { Professional } from "@/generated/prisma/client";

interface ProfessionalCardProps {
  professional: Professional;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const initials =
    (professional.firstName[0] ?? "") + (professional.lastName[0] ?? "");

  async function handleDelete() {
    const result = await deleteProfessional(professional.id);
    if (result.success) {
      toast.success("Profesional eliminado correctamente");
    }
  }

  return (
    <>
      <Card className="relative flex min-h-64 flex-col items-center p-5 pt-8 shadow-sm rounded-xl">
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Avatar size="lg">
          <AvatarFallback
            className="text-sm font-semibold text-white"
            style={{ backgroundColor: professional.color }}
          >
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="mt-3 flex flex-col items-center text-center">
          <h3 className="font-semibold leading-tight">
            {professional.lastName}, {professional.firstName}
          </h3>
          <Badge variant="secondary" className="mt-2">
            {professional.specialty}
          </Badge>
        </div>

        <div className="mt-4 w-full space-y-1.5 text-xs text-muted-foreground border-t pt-4">
          <p className="truncate">
            <span className="font-medium text-foreground">Matricula:</span>{" "}
            {professional.licenseNumber}
          </p>
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="h-3 w-3 shrink-0" />
            {professional.phone}
          </div>
          {professional.email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {professional.email}
            </div>
          )}
        </div>
      </Card>

      <ProfessionalFormDialog
        mode="edit"
        professional={professional}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar profesional"
        description={`¿Está seguro de que desea eliminar a ${professional.firstName} ${professional.lastName}? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
