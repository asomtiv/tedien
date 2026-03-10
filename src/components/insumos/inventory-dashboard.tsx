"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryTable } from "./inventory-table";
import { ActivityTimeline } from "./activity-timeline";

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

interface CategoryOption {
  id: string;
  name: string;
}

interface MovementData {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  professionalId: string | null;
  patientId: string | null;
  createdAt: Date;
  product: {
    name: string;
    unit: string;
  };
}

interface ProfessionalLookup {
  id: string;
  lastName: string;
}

interface PatientLookup {
  id: string;
  firstName: string;
  lastName: string;
}

interface InventoryDashboardProps {
  products: ProductWithCategory[];
  categories: CategoryOption[];
  movements: MovementData[];
  professionals: ProfessionalLookup[];
  patients: PatientLookup[];
}

export function InventoryDashboard({
  products,
  categories,
  movements,
  professionals,
  patients,
}: InventoryDashboardProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("__all__");

  const filteredProducts = useMemo(() => {
    const now = new Date();

    return products
      .filter((p) => {
        const matchesSearch = p.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory =
          categoryFilter === "__all__" || p.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const aExpired =
          a.expirationDate && new Date(a.expirationDate) <= now ? 1 : 0;
        const bExpired =
          b.expirationDate && new Date(b.expirationDate) <= now ? 1 : 0;
        if (aExpired !== bExpired) return bExpired - aExpired;

        const aLow = a.stock <= a.minStock ? 1 : 0;
        const bLow = b.stock <= b.minStock ? 1 : 0;
        if (aLow !== bLow) return bLow - aLow;

        return a.name.localeCompare(b.name);
      });
  }, [products, search, categoryFilter]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5fr_7fr]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar insumo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {categoryFilter === "__all__"
                  ? "Todas las categorías"
                  : (categories.find((c) => c.id === categoryFilter)?.name ?? "Todas las categorías")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="__all__">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <InventoryTable products={filteredProducts} />
      </div>
      <ActivityTimeline
        movements={movements}
        professionals={professionals}
        patients={patients}
      />
    </div>
  );
}
