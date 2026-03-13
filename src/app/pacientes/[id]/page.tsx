import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClinicalInitBanner } from "@/components/patients/clinical-init-banner";
import { EvolutionFormDialog } from "@/components/patients/evolution-form-dialog";
import { OdontogramSection } from "@/components/patients/odontogram-section";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      clinicalHistory: {
        include: {
          evolutions: {
            include: {
              professional: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!patient) notFound();

  const history = patient.clinicalHistory;
  const needsInit = history && !history.initialized;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/pacientes">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {patient.lastName}, {patient.firstName}
          </h2>
          <p className="text-muted-foreground">DNI: {patient.dni}</p>
        </div>
      </div>

      {needsInit && <ClinicalInitBanner historyId={history.id} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Datos del Paciente</h3>
          <div className="space-y-2 text-sm">
            {patient.phone && (
              <p>
                <span className="font-medium">Teléfono:</span> {patient.phone}
              </p>
            )}
            {patient.email && (
              <p>
                <span className="font-medium">Email:</span> {patient.email}
              </p>
            )}
            {patient.notes && (
              <p>
                <span className="font-medium">Notas:</span> {patient.notes}
              </p>
            )}
            <p>
              <span className="font-medium">Registrado:</span>{" "}
              {format(patient.createdAt, "dd/MM/yyyy", { locale: es })}
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Historia Clínica</h3>
          {history && history.initialized ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Grupo Sanguíneo:</span>{" "}
                {history.bloodType || "—"}
              </p>
              <p>
                <span className="font-medium">Enfermedades Crónicas:</span>{" "}
                {history.chronicDiseases || "—"}
              </p>
              <p>
                <span className="font-medium">Alergias:</span>{" "}
                {history.allergies || "—"}
              </p>
              <p>
                <span className="font-medium">Medicamentos Actuales:</span>{" "}
                {history.currentMedications || "—"}
              </p>
              <p>
                <span className="font-medium">Notas Generales:</span>{" "}
                {history.generalNotes || "—"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ficha médica pendiente de completar
            </p>
          )}
        </Card>
      </div>

      {history && history.initialized && (
        <OdontogramSection
          historyId={history.id}
          initialData={history.odontogramData}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Evoluciones</h3>
          {history && history.initialized && (
            <EvolutionFormDialog historyId={history.id} patientId={id} />
          )}
        </div>

        {!history || history.evolutions.length === 0 ? (
          <Card className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">
              No hay evoluciones registradas
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Profesional</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tratamiento</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pieza / Cara</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {history.evolutions.map((evo) => (
                    <tr key={evo.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(evo.date, "dd/MM/yyyy HH:mm", { locale: es })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {evo.professional.lastName}, {evo.professional.firstName}
                      </td>
                      <td className="px-4 py-3">{evo.treatment}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {evo.tooth ? `${evo.tooth} — ${evo.face}` : evo.face}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="line-clamp-2">{evo.description || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
