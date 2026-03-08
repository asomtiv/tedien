"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function initializeClinicalHistory(
  historyId: string,
  data: {
    bloodType: string;
    chronicDiseases: string;
    allergies: string;
    currentMedications: string;
  }
) {
  const history = await prisma.clinicalHistory.findUnique({
    where: { id: historyId },
  });

  if (!history) {
    return { error: "Historia clínica no encontrada" };
  }

  if (history.initialized) {
    return { error: "La ficha médica ya fue completada" };
  }

  await prisma.clinicalHistory.update({
    where: { id: historyId },
    data: {
      bloodType: data.bloodType || null,
      chronicDiseases: data.chronicDiseases || null,
      allergies: data.allergies || null,
      currentMedications: data.currentMedications || null,
      initialized: true,
    },
  });

  revalidatePath(`/pacientes/${history.patientId}`);
  return { success: true };
}
