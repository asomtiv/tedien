"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ProfessionalOption {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  color: string;
}

interface ProfessionalFilterProps {
  professionals: ProfessionalOption[];
  selectedProfessional: string;
  selectedSpecialty: string;
}

export function ProfessionalFilter({
  professionals,
  selectedProfessional,
  selectedSpecialty,
}: ProfessionalFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isActive = selectedProfessional !== "all" || selectedSpecialty !== "";
  const specialties = [...new Set(professionals.map((p) => p.specialty))].sort();

  function selectProfessional(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("specialty");
    if (id === "all") {
      params.delete("professional");
    } else {
      params.set("professional", id);
    }
    router.replace(`/agenda?${params.toString()}`);
  }

  function selectSpecialty(specialty: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("professional");
    if (specialty === "") {
      params.delete("specialty");
    } else {
      params.set("specialty", specialty);
    }
    router.replace(`/agenda?${params.toString()}`);
  }

  function clearFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("professional");
    params.delete("specialty");
    router.replace(`/agenda?${params.toString()}`);
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant={isActive ? "default" : "outline"} />
        }
      >
        <Filter className="h-4 w-4" />
        Filtrar
        {isActive && (
          <span className="ml-0.5 h-2 w-2 rounded-full bg-primary-foreground/70" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0 gap-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <span className="text-sm font-medium">Filtros</span>
          {isActive && (
            <button
              onClick={clearFilter}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>

        <div className="border-b p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Por Profesional
          </p>
          <div className="space-y-0.5">
            <button
              onClick={() => selectProfessional("all")}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                selectedProfessional === "all" && selectedSpecialty === "" &&
                  "bg-accent font-medium"
              )}
            >
              Todos los profesionales
            </button>
            {professionals.map((pro) => (
              <button
                key={pro.id}
                onClick={() => selectProfessional(pro.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                  selectedProfessional === pro.id && "bg-accent font-medium"
                )}
              >
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: pro.color }}
                />
                {pro.lastName}, {pro.firstName}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Por Especialidad
          </p>
          <div className="space-y-0.5">
            {specialties.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                Sin especialidades registradas
              </p>
            )}
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => selectSpecialty(specialty)}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                  selectedSpecialty === specialty && "bg-accent font-medium"
                )}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
