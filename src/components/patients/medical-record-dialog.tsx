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
import { Spinner } from "@/components/ui/spinner";
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
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      const patients = await searchPatients(query);
      setResults(patients);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setQuery("");
      setResults([]);
      setSelectedId(null);
      setSelectedPatient(null);
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

        {!selectedId && (
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId(null);
              }}
              placeholder="Buscar por nombre o DNI..."
              autoComplete="off"
              autoFocus
              className="pr-8"
            />
            {loading && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Spinner />
              </span>
            )}
          </div>
        )}

        {results.length > 0 && !selectedId && (
          <div className="max-h-60 overflow-y-auto rounded-lg border">
            {results.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => { setSelectedId(patient.id); setSelectedPatient(patient); }}
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

        {selectedPatient && (
          <p className="text-sm font-medium">
            {selectedPatient.lastName}, {selectedPatient.firstName} — DNI: {selectedPatient.dni}
          </p>
        )}

        {query.length > 0 && results.length === 0 && !selectedId && (
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
