"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initializeClinicalHistory } from "@/app/actions/clinical-history";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface ClinicalInitBannerProps {
  historyId: string;
}

export function ClinicalInitBanner({ historyId }: ClinicalInitBannerProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bloodType, setBloodType] = useState("");
  const [chronicDiseases, setChronicDiseases] = useState("");
  const [allergies, setAllergies] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await initializeClinicalHistory(historyId, {
      bloodType,
      chronicDiseases,
      allergies,
      currentMedications,
    });

    setLoading(false);

    if (result.success) {
      toast.success("Ficha médica completada correctamente");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
          <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Iniciar Ficha Médica
          </h3>
          <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
            Este paciente aún no cuenta con sus antecedentes clínicos
            registrados. Por seguridad, complete antes de proceder.
          </p>
        </div>
        {!expanded && (
          <Button
            size="sm"
            onClick={() => setExpanded(true)}
            className="shrink-0"
          >
            Completar Ficha
          </Button>
        )}
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="border-t border-blue-200 dark:border-blue-900 p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Grupo Sanguíneo</Label>
              <Select
                value={bloodType}
                onValueChange={(val) => { if (val) setBloodType(val); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chronicDiseases">Enfermedades Crónicas</Label>
              <textarea
                id="chronicDiseases"
                value={chronicDiseases}
                onChange={(e) => setChronicDiseases(e.target.value)}
                placeholder="Ej: Diabetes, Hipertensión..."
                rows={2}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias Conocidas</Label>
              <textarea
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ej: Penicilina, Látex..."
                rows={2}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentMedications">Medicamentos Actuales</Label>
              <textarea
                id="currentMedications"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                placeholder="Ej: Metformina 500mg, Losartán 50mg..."
                rows={2}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpanded(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Guardando..." : "Guardar y Bloquear Ficha"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
