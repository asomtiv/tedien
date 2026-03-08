"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const professionalSchema = z.object({
  firstName: z.string().min(1, "Nombre es obligatorio"),
  lastName: z.string().min(1, "Apellido es obligatorio"),
  dni: z.string().min(1, "DNI es obligatorio"),
  specialty: z.string().min(1, "Especialidad es obligatoria"),
  licenseNumber: z.string().min(1, "Matricula es obligatoria"),
  phone: z.string().min(1, "Telefono es obligatorio"),
  email: z.string().refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalido").optional(),
  color: z.string().min(1, "Color es obligatorio"),
});

export async function createProfessional(formData: FormData) {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    dni: formData.get("dni") as string,
    specialty: formData.get("specialty") as string,
    licenseNumber: formData.get("licenseNumber") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || "",
    color: formData.get("color") as string,
  };

  const result = professionalSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;

  await prisma.professional.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      specialty: data.specialty,
      licenseNumber: data.licenseNumber,
      phone: data.phone,
      email: data.email || null,
      color: data.color,
    },
  });

  revalidatePath("/profesionales");
  return { success: true };
}

export async function updateProfessional(id: string, formData: FormData) {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    dni: formData.get("dni") as string,
    specialty: formData.get("specialty") as string,
    licenseNumber: formData.get("licenseNumber") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || "",
    color: formData.get("color") as string,
  };

  const result = professionalSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;

  await prisma.professional.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      specialty: data.specialty,
      licenseNumber: data.licenseNumber,
      phone: data.phone,
      email: data.email || null,
      color: data.color,
    },
  });

  revalidatePath("/profesionales");
  return { success: true };
}

export async function deleteProfessional(id: string) {
  await prisma.professional.delete({
    where: { id },
  });

  revalidatePath("/profesionales");
  return { success: true };
}

export async function getAllProfessionals() {
  return prisma.professional.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialty: true,
      color: true,
    },
    orderBy: { lastName: "asc" },
  });
}
