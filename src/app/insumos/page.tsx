import { prisma } from "@/lib/prisma";
import { NewProductDialog } from "@/components/insumos/new-product-dialog";
import { InventoryDashboard } from "@/components/insumos/inventory-dashboard";

export const dynamic = "force-dynamic";

export default async function InsumosPage() {
  const [products, categories, movements, professionals, patients] =
    await Promise.all([
      prisma.product.findMany({
        include: { category: true },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.productMovement.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, unit: true } },
        },
      }),
      prisma.professional.findMany({
        select: { id: true, lastName: true },
      }),
      prisma.patient.findMany({
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Insumos</h2>
        <NewProductDialog categories={categories} />
      </div>
      <InventoryDashboard
        products={products}
        categories={categories}
        movements={movements}
        professionals={professionals}
        patients={patients}
      />
    </div>
  );
}
