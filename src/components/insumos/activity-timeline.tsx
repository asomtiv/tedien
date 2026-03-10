"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  function formatMovement(m: MovementData) {
    const prof = m.professionalId
      ? professionals.find((p) => p.id === m.professionalId)
      : null;
    const patient = m.patientId
      ? patients.find((p) => p.id === m.patientId)
      : null;

    const sign = m.type === "ENTRY" ? "+" : "-";

    if (m.reason === "Consulta" && prof && patient) {
      return `${sign}${m.quantity} ${m.product.unit} — Dr. ${prof.lastName} / ${patient.firstName} ${patient.lastName}`;
    }

    return `${sign}${m.quantity} ${m.product.unit} — ${m.product.name}`;
  }

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
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {movements.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            No hay movimientos registrados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-5 pl-6"></TableHead>
                <TableHead>Movimiento</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="pr-6 text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="pl-6">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        m.type === "ENTRY" ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <span className="block truncate text-sm leading-snug">
                      {formatMovement(m)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ReasonBadge reason={m.reason} />
                  </TableCell>
                  <TableCell className="pr-6 text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(m.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
