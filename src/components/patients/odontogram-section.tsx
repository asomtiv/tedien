"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OdontogramBoard } from "@/components/odontogram";
import type { OdontogramData } from "@/components/odontogram";
import { saveOdontogram } from "@/app/actions/clinical-history";

const EMPTY_DATA: OdontogramData = { teeth: {}, prostheses: [] };

interface OdontogramSectionProps {
  historyId: string;
  initialData: string | null;
}

export function OdontogramSection({
  historyId,
  initialData,
}: OdontogramSectionProps) {
  const router = useRouter();
  const isSaved = initialData !== null;
  const [data, setData] = useState<OdontogramData>(
    isSaved ? JSON.parse(initialData) : EMPTY_DATA
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await saveOdontogram(historyId, JSON.stringify(data));
    setSaving(false);
    if (result.success) {
      toast.success("Odontograma guardado correctamente");
      router.refresh();
    } else if (result.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Odontograma</h3>
        {!isSaved && (
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Guardando..." : "Guardar Odontograma"}
          </Button>
        )}
      </div>
      <Card className="overflow-x-auto p-4">
        <OdontogramBoard data={data} onChange={setData} readOnly={isSaved} />
      </Card>
    </div>
  );
}
