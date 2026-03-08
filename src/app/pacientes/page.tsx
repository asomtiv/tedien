export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { RecentPatientsTable } from "@/components/dashboard/recent-patients-table";
import { NewPatientDialog } from "@/components/patients/new-patient-dialog";

export default async function PacientesPage() {
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
        <NewPatientDialog />
      </div>

      <RecentPatientsTable patients={patients} />
    </div>
  );
}
