"use server";

import { prisma } from "@/lib/prisma";

export async function getAllSpecialties() {
  return prisma.specialty.findMany({
    orderBy: { name: "asc" },
  });
}
