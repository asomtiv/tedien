'use client';

interface ProsthesisToolbarProps {
  isActive: boolean;
  onToggle: () => void;
  selectedCount: number;
  onCreate: () => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export function ProsthesisToolbar({
  isActive,
  onToggle,
  selectedCount,
  onCreate,
  onCancel,
  readOnly,
}: ProsthesisToolbarProps) {
  if (readOnly) return null;

  return (
    <div className="absolute right-4 top-4 flex items-center gap-2">
      {!isActive && (
        <button
          onClick={onToggle}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/80"
        >
          Marcar Prótesis
        </button>
      )}

      {isActive && (
        <>
          <span className="text-xs text-muted-foreground">
            {selectedCount === 0
              ? 'Selecciona dientes'
              : `${selectedCount} seleccionado${selectedCount > 1 ? 's' : ''}`}
          </span>

          <button
            onClick={onCreate}
            disabled={selectedCount < 2}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Marcar
          </button>

          <button
            onClick={onCancel}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}
