"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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

interface ActivityTimelineProps {
  movements: MovementData[];
  professionals: ProfessionalLookup[];
  patients: PatientLookup[];
}

export function ActivityTimeline({
  movements,
  professionals,
  patients,
}: ActivityTimelineProps) {
  function formatDate(date: Date) {
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function ReasonBadge({ reason }: { reason: string }) {
    if (reason === "Ajuste") {
      return <Badge variant="outline">{reason}</Badge>;
    }
    if (reason === "Compra") {
      return <Badge variant="secondary">{reason}</Badge>;
    }
    if (reason === "Consulta") {
      return <Badge variant="default">{reason}</Badge>;
    }
    return <span className="text-sm text-muted-foreground">{reason}</span>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Actividad Reciente</h2>
      <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20">
        {movements.length === 0 ? (
          <p className="px-6 py-6 text-sm text-muted-foreground">
            No hay movimientos registrados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-5 pl-5"></TableHead>
                <TableHead>Movimiento</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Dr/a</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="pr-5 text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => {
                const prof = m.professionalId
                  ? professionals.find((p) => p.id === m.professionalId)
                  : null;
                const patient = m.patientId
                  ? patients.find((p) => p.id === m.patientId)
                  : null;
                const sign = m.type === "ENTRY" ? "+" : "-";

                return (
                  <TableRow key={m.id}>
                    <TableCell className="pl-5">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          m.type === "ENTRY" ? "bg-green-500" : "bg-red-500"
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {sign}{m.quantity} {m.product.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{m.product.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {prof ? `Dr/a. ${prof.lastName}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {patient ? `${patient.lastName}, ${patient.firstName}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ReasonBadge reason={m.reason} />
                    </TableCell>
                    <TableCell className="pr-5 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
