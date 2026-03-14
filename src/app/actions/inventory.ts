"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(1, "Nombre es obligatorio"),
  stock: z.number().int().min(0, "Stock no puede ser negativo"),
  minStock: z.number().int().min(0, "Stock mínimo no puede ser negativo"),
  unit: z.string().min(1, "Unidad es obligatoria"),
  expirationDate: z.string().optional(),
  categoryId: z.string().min(1, "Categoría es obligatoria"),
});

export async function createProduct(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    stock: parseInt(formData.get("stock") as string) || 0,
    minStock: parseInt(formData.get("minStock") as string) || 5,
    unit: formData.get("unit") as string,
    expirationDate: (formData.get("expirationDate") as string) || undefined,
    categoryId: formData.get("categoryId") as string,
  };

  const result = productSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      stock: data.stock,
      minStock: data.minStock,
      unit: data.unit,
      expirationDate: data.expirationDate
        ? new Date(data.expirationDate)
        : null,
      categoryId: data.categoryId,
    },
  });

  if (data.stock > 0) {
    await prisma.productMovement.create({
      data: {
        productId: product.id,
        type: "ENTRY",
        quantity: data.stock,
        reason: "Compra",
      },
    });
  }

  revalidatePath("/insumos");
  return { success: true };
}

export async function updateStock(
  productId: string,
  type: "ENTRY" | "EXIT",
  quantity: number,
  reason: string,
  meta?: {
    appointmentId?: string;
    patientId?: string;
    professionalId?: string;
  }
) {
  if (quantity <= 0) {
    return { error: "La cantidad debe ser mayor a cero" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return { error: "Producto no encontrado" };
  }

  if (type === "EXIT" && product.stock - quantity < 0) {
    return { error: "Stock insuficiente" };
  }

  const stockChange = type === "ENTRY" ? quantity : -quantity;

  await prisma.product.update({
    where: { id: productId },
    data: { stock: product.stock + stockChange },
  });

  await prisma.productMovement.create({
    data: {
      productId,
      type,
      quantity,
      reason,
      appointmentId: meta?.appointmentId,
      patientId: meta?.patientId,
      professionalId: meta?.professionalId,
    },
  });

  revalidatePath("/insumos");
  return { success: true };
}

export async function getAvailableProducts() {
  return prisma.product.findMany({
    where: { stock: { gt: 0 } },
    select: { id: true, name: true, stock: true, unit: true },
    orderBy: { name: "asc" },
  });
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/insumos");
  return { success: true };
}
