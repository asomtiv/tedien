"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createPatient(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const dni = formData.get("dni") as string;
  const phone = (formData.get("phone") as string) || null;
  const email = (formData.get("email") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!firstName || !lastName || !dni) {
    return { error: "Nombre, Apellido y DNI son obligatorios" };
  }

  await prisma.patient.create({
    data: { firstName, lastName, dni, phone, email, notes },
  });

  revalidatePath("/pacientes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePatient(id: string, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const dni = formData.get("dni") as string;
  const phone = (formData.get("phone") as string) || null;
  const email = (formData.get("email") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!firstName || !lastName || !dni) {
    return { error: "Nombre, Apellido y DNI son obligatorios" };
  }

  await prisma.patient.update({
    where: { id },
    data: { firstName, lastName, dni, phone, email, notes },
  });

  revalidatePath("/pacientes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({
    where: { id },
  });

  revalidatePath("/pacientes");
  revalidatePath("/dashboard");
  return { success: true };
}
