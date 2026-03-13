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
    generalNotes: string;
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
      generalNotes: data.generalNotes || null,
      initialized: true,
    },
  });

  revalidatePath(`/pacientes/${history.patientId}`);
  return { success: true };
}

export async function saveOdontogram(historyId: string, data: string) {
  const history = await prisma.clinicalHistory.findUnique({
    where: { id: historyId },
  });

  if (!history) {
    return { error: "Historia clínica no encontrada" };
  }

  if (!history.initialized) {
    return { error: "La ficha médica debe completarse antes del odontograma" };
  }

  if (history.odontogramData !== null) {
    return { error: "El odontograma ya fue registrado" };
  }

  try {
    JSON.parse(data);
  } catch {
    return { error: "Datos de odontograma inválidos" };
  }

  await prisma.clinicalHistory.update({
    where: { id: historyId },
    data: { odontogramData: data },
  });

  revalidatePath(`/pacientes/${history.patientId}`);
  return { success: true };
}

export async function getUnlinkedAppointments(patientId: string) {
  return prisma.appointment.findMany({
    where: {
      patientId,
      evolution: null,
    },
    select: {
      id: true,
      date: true,
      reason: true,
      professional: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function createEvolution(data: {
  historyId: string;
  appointmentId: string;
  professionalId: string;
  treatment: string;
  description: string;
  tooth?: string;
  face: string;
}) {
  if (!data.historyId || !data.appointmentId || !data.professionalId || !data.treatment || !data.face) {
    return { error: "Turno, profesional, tratamiento y cara son obligatorios" };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
  });

  if (!appointment) {
    return { error: "Turno no encontrado" };
  }

  const existing = await prisma.evolution.findUnique({
    where: { appointmentId: data.appointmentId },
  });

  if (existing) {
    return { error: "Este turno ya tiene una evolución registrada" };
  }

  const history = await prisma.clinicalHistory.findUnique({
    where: { id: data.historyId },
  });

  if (!history) {
    return { error: "Historia clínica no encontrada" };
  }

  await prisma.evolution.create({
    data: {
      historyId: data.historyId,
      appointmentId: data.appointmentId,
      professionalId: data.professionalId,
      date: appointment.date,
      treatment: data.treatment,
      description: data.description || "",
      tooth: data.tooth || null,
      face: data.face,
    },
  });

  revalidatePath(`/pacientes/${history.patientId}`);
  return { success: true };
}
