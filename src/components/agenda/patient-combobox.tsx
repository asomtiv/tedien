"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { searchPatients } from "@/app/actions/appointments";
import { cn } from "@/lib/utils";

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
}

interface PatientComboboxProps {
  value: string | null;
  onChange: (patientId: string | null, label: string) => void;
  initialLabel?: string;
}

export function PatientCombobox({
  value,
  onChange,
  initialLabel = "",
}: PatientComboboxProps) {
  const [query, setQuery] = useState(initialLabel);
  const [results, setResults] = useState<PatientOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(!!value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected || query.length < 1) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const patients = await searchPatients(query);
      setResults(patients);
      setIsOpen(patients.length > 0);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, isSelected]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(patient: PatientOption) {
    const label = `${patient.lastName}, ${patient.firstName} — DNI: ${patient.dni}`;
    setQuery(label);
    setIsSelected(true);
    setIsOpen(false);
    onChange(patient.id, label);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (isSelected) {
      setIsSelected(false);
      onChange(null, "");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (results.length > 0 && !isSelected) setIsOpen(true);
        }}
        placeholder="Buscar por nombre o DNI..."
        autoComplete="off"
      />
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
          {results.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => handleSelect(patient)}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                value === patient.id && "bg-accent"
              )}
            >
              {patient.lastName}, {patient.firstName} — DNI: {patient.dni}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
