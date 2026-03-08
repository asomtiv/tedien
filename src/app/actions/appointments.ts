"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createAppointment(data: {
  patientId: string;
  date: string;
  time: string;
  reason: string;
  status?: string;
}) {
  if (!data.patientId || !data.date || !data.time || !data.reason) {
    return { error: "Paciente, fecha, hora y motivo son obligatorios" };
  }

  const dateTime = new Date(`${data.date}T${data.time}:00`);

  await prisma.appointment.create({
    data: {
      date: dateTime,
      reason: data.reason,
      status: data.status || "pendiente",
      patientId: data.patientId,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAppointment(
  id: string,
  data: {
    patientId?: string;
    date?: string;
    time?: string;
    reason?: string;
    status?: string;
  }
) {
  const updateData: Record<string, unknown> = {};

  if (data.reason !== undefined) updateData.reason = data.reason;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.patientId !== undefined) updateData.patientId = data.patientId;

  if (data.date && data.time) {
    updateData.date = new Date(`${data.date}T${data.time}:00`);
  }

  await prisma.appointment.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({
    where: { id },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function searchPatients(query: string) {
  if (!query || query.length < 1) return [];

  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { dni: { contains: query } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, dni: true },
    take: 10,
  });

  return patients;
}
