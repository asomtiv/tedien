'use client';

import type { FaceName, FaceStatus, ToothOverlay } from './types';
import { STATUS_COLORS, FACE_LABELS, STATUS_OPTIONS, OVERLAY_OPTIONS } from './constants';

interface ToothPopoverContentProps {
  toothId: string;
  face: FaceName;
  currentFaceStatus: FaceStatus;
  currentOverlay: ToothOverlay;
  onFaceSelect: (status: FaceStatus) => void;
  onOverlaySelect: (overlay: ToothOverlay) => void;
}

export function ToothPopoverContent({
  toothId,
  face,
  currentFaceStatus,
  currentOverlay,
  onFaceSelect,
  onOverlaySelect,
}: ToothPopoverContentProps) {
  return (
    <div className="min-w-[170px] rounded-lg border border-border bg-popover p-3 shadow-xl">
      {/* Section 1: Face diagnosis */}
      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {toothId} &middot; {FACE_LABELS[face]}
      </p>
      <div className="flex flex-col gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFaceSelect(opt.value)}
            className={[
              'flex items-center gap-2 rounded px-2 py-1.5 text-sm text-popover-foreground',
              'transition-colors hover:bg-accent',
              currentFaceStatus === opt.value
                ? 'bg-accent ring-1 ring-border'
                : '',
            ].join(' ')}
          >
            <span
              className="h-3 w-3 rounded-full border border-border shrink-0"
              style={{ backgroundColor: STATUS_COLORS[opt.value] }}
            />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="my-2 border-t border-border" />

      {/* Section 2: Tooth-level overlay */}
      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Tratamiento
      </p>
      <div className="flex flex-col gap-1">
        {OVERLAY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onOverlaySelect(opt.value)}
            className={[
              'flex items-center gap-2 rounded px-2 py-1.5 text-sm text-popover-foreground',
              'transition-colors hover:bg-accent',
              currentOverlay === opt.value
                ? 'bg-accent ring-1 ring-border'
                : '',
            ].join(' ')}
          >
            <OverlayIcon type={opt.value} color={opt.color} />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OverlayIcon({ type, color }: { type: ToothOverlay; color: string }) {
  if (type === 'none') {
    return <span className="flex h-3 w-3 items-center justify-center text-[8px] text-muted-foreground">—</span>;
  }
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0">
      {type === 'extraction' || type === 'absent' ? (
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <line x1="2" y1="2" x2="14" y2="14" />
          <line x1="14" y1="2" x2="2" y2="14" />
        </g>
      ) : (
        <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="2" />
      )}
    </svg>
  );
}
