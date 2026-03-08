import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClinicalInitBanner } from "@/components/patients/clinical-init-banner";

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
            include: { professional: { select: { firstName: true, lastName: true } } },
            orderBy: { date: "desc" },
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Evoluciones</h3>
        {!history || history.evolutions.length === 0 ? (
          <Card className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">
              No hay evoluciones registradas
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.evolutions.map((evo) => (
              <Card key={evo.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {format(evo.date, "dd/MM/yyyy HH:mm", { locale: es })}
                  </span>
                  <Badge variant="secondary">
                    {evo.professional.lastName}, {evo.professional.firstName}
                  </Badge>
                </div>
                <p className="text-sm">
                  <span className="font-medium">Tratamiento:</span> {evo.treatment}
                </p>
                <p className="text-sm text-muted-foreground">{evo.description}</p>
                {evo.tooth && (
                  <p className="text-sm">
                    <span className="font-medium">Pieza:</span> {evo.tooth}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Cara:</span> {evo.face}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
