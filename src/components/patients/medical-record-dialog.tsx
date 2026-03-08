"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchPatients } from "@/app/actions/appointments";
import { cn } from "@/lib/utils";

interface PatientResult {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
}

export function MedicalRecordDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const patients = await searchPatients(query);
      setResults(patients);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setQuery("");
      setResults([]);
      setSelectedId(null);
    }
  }

  function handleConfirm() {
    if (!selectedId) return;
    setOpen(false);
    router.push(`/pacientes/${selectedId}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <ClipboardList className="mr-2 h-4 w-4" />
        Ficha Médica
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar Ficha Médica</DialogTitle>
          <DialogDescription>
            Busque un paciente por nombre, apellido o DNI.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId(null);
          }}
          placeholder="Buscar por nombre o DNI..."
          autoComplete="off"
          autoFocus
        />

        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto rounded-lg border">
            {results.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => setSelectedId(patient.id)}
                className={cn(
                  "flex w-full items-center px-3 py-2.5 text-sm transition-colors hover:bg-accent",
                  selectedId === patient.id && "bg-accent font-medium"
                )}
              >
                {patient.lastName}, {patient.firstName} — DNI: {patient.dni}
              </button>
            ))}
          </div>
        )}

        {query.length > 0 && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No se encontraron pacientes
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            Ver Ficha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
