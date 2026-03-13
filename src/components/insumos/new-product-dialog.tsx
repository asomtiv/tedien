"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createProduct } from "@/app/actions/inventory";

const UNIT_OPTIONS = [
  "unidades",
  "ml",
  "cajas",
  "pares",
  "sobres",
  "gramos",
  "litros",
  "rollos",
  "tubos",
  "frascos",
];

interface CategoryOption {
  id: string;
  name: string;
}

interface NewProductDialogProps {
  categories: CategoryOption[];
}

export function NewProductDialog({ categories }: NewProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const unitInputRef = useRef<HTMLInputElement>(null);

  const filteredUnits = UNIT_OPTIONS.filter((u) =>
    u.toLowerCase().includes(unitSearch.toLowerCase())
  );

  function selectUnit(value: string) {
    setUnit(value);
    setUnitSearch(value);
    setUnitDropdownOpen(false);
  }

  function resetForm() {
    setCategoryId("");
    setUnit("");
    setUnitSearch("");
    setUnitDropdownOpen(false);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("categoryId", categoryId);
    formData.set("unit", unit);

    const result = await createProduct(formData);
    if (result?.success) {
      toast.success("Insumo registrado correctamente");
      setOpen(false);
      resetForm();
    } else if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Insumo
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Insumo</DialogTitle>
          <DialogDescription>
            Complete los datos del insumo para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="prod-name">Nombre *</Label>
            <Input
              id="prod-name"
              name="name"
              required
              placeholder="Ej: Guantes de latex"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                value={categoryId}
                onValueChange={(val) => {
                  if (val) setCategoryId(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar">
                    {categories.find((c) => c.id === categoryId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="prod-unit">Unidad *</Label>
              <Input
                ref={unitInputRef}
                id="prod-unit"
                value={unitSearch}
                autoComplete="off"
                placeholder="Buscar unidad..."
                onChange={(e) => {
                  setUnitSearch(e.target.value);
                  setUnit("");
                  setUnitDropdownOpen(true);
                }}
                onFocus={() => setUnitDropdownOpen(true)}
                onBlur={() => {
                  // Delay to allow click on option
                  setTimeout(() => setUnitDropdownOpen(false), 150);
                }}
              />
              {unitDropdownOpen && unitSearch.length > 0 && filteredUnits.length > 0 && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-lg bg-popover shadow-md ring-1 ring-foreground/10">
                  {filteredUnits.map((u) => (
                    <button
                      key={u}
                      type="button"
                      className={cn(
                        "flex w-full cursor-default items-center px-3 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        unit === u && "bg-accent text-accent-foreground"
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectUnit(u);
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prod-stock">Stock inicial</Label>
              <Input
                id="prod-stock"
                name="stock"
                type="number"
                min={0}
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-minStock">Stock mínimo</Label>
              <Input
                id="prod-minStock"
                name="minStock"
                type="number"
                min={0}
                defaultValue="5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-expiration">Fecha de vencimiento</Label>
            <Input
              id="prod-expiration"
              name="expirationDate"
              type="date"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
