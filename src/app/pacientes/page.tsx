export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { RecentPatientsTable } from "@/components/dashboard/recent-patients-table";
import { NewPatientDialog } from "@/components/patients/new-patient-dialog";
import { MedicalRecordDialog } from "@/components/patients/medical-record-dialog";

export default async function PacientesPage() {
  const [patients, provinces, socialInsurances] = await Promise.all([
    prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: { province: true, socialInsurance: true },
    }),
    prisma.province.findMany({ orderBy: { name: "asc" } }),
    prisma.socialInsurance.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
        <div className="flex items-center gap-3">
          <MedicalRecordDialog />
          <NewPatientDialog provinces={provinces} socialInsurances={socialInsurances} />
        </div>
      </div>

      <RecentPatientsTable
        patients={patients}
        provinces={provinces}
        socialInsurances={socialInsurances}
      />
    </div>
  );
}
