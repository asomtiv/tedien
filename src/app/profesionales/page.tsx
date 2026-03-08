import { Stethoscope } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProfessionalCard } from "@/components/professionals/professional-card";
import { ProfessionalFormDialog } from "@/components/professionals/professional-form-dialog";

export const dynamic = "force-dynamic";

export default async function ProfesionalesPage() {
  const professionals = await prisma.professional.findMany({
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profesionales</h2>
        <ProfessionalFormDialog mode="create" />
      </div>

      {professionals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-sm">
          <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            No hay profesionales registrados
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Agregue un profesional para comenzar a gestionar turnos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
            />
          ))}
        </div>
      )}
    </div>
  );
}
