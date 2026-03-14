"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { updateStock, deleteProduct } from "@/app/actions/inventory";

interface ProductWithCategory {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  expirationDate: Date | null;
  categoryId: string;
  category: { id: string; name: string };
}

interface InventoryTableProps {
  products: ProductWithCategory[];
}

function ExpirationBadge({ date }: { date: Date | null }) {
  if (!date) return <span className="text-muted-foreground">—</span>;

  const now = new Date();
  const exp = new Date(date);
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return <Badge variant="destructive">Vencido</Badge>;
  }

  if (diffDays <= 30) {
    return (
      <Badge
        variant="outline"
        className="border-orange-400 text-orange-600"
      >
        Próx. a vencer
      </Badge>
    );
  }

  return (
    <span className="text-sm text-muted-foreground">
      {exp.toLocaleDateString("es-AR")}
    </span>
  );
}

export function InventoryTable({ products }: InventoryTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function handleStockChange(
    productId: string,
    type: "ENTRY" | "EXIT"
  ) {
    const result = await updateStock(productId, type, 1, "Ajuste");
    if (result?.error) {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteProduct(deleteTarget);
    if (result?.success) {
      toast.success("Insumo eliminado");
    }
    setDeleteTarget(null);
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12 text-center shadow-sm">
        <p className="text-lg font-medium text-muted-foreground">
          No hay insumos registrados
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Agregue un insumo para comenzar a gestionar el inventario
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.category.name}</Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-bold",
                      product.stock <= product.minStock && "text-destructive"
                    )}
                  >
                    {product.stock}
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">
                    {product.unit}
                  </span>
                </TableCell>
                <TableCell>
                  <ExpirationBadge date={product.expirationDate} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleStockChange(product.id, "ENTRY")}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={product.stock === 0}
                      onClick={() => handleStockChange(product.id, "EXIT")}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Eliminar insumo"
        description="¿Está seguro de eliminar este insumo? Se eliminarán también todos los movimientos asociados."
        onConfirm={handleDelete}
      />
    </>
  );
}
