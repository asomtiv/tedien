'use client';

import { useEffect, useState, useCallback, type RefObject } from 'react';
import type { Prosthesis } from './types';

interface ProsthesisOverlayProps {
  prostheses: Prosthesis[];
  containerRef: RefObject<HTMLDivElement | null>;
  onRemove: (prosthesisId: string) => void;
  readOnly?: boolean;
}

interface ProsthesisRect {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ProsthesisOverlay({
  prostheses,
  containerRef,
  onRemove,
  readOnly,
}: ProsthesisOverlayProps) {
  const [rects, setRects] = useState<ProsthesisRect[]>([]);

  const calculateRects = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newRects: ProsthesisRect[] = [];

    for (const prosthesis of prostheses) {
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;
      let found = false;

      for (const toothId of prosthesis.teeth) {
        const wrapper = container.querySelector(`[data-tooth-id="${toothId}"]`);
        if (!wrapper) continue;
        const el = wrapper.querySelector('[data-tooth-svg]') ?? wrapper;
        const rect = el.getBoundingClientRect();
        minLeft = Math.min(minLeft, rect.left - containerRect.left);
        minTop = Math.min(minTop, rect.top - containerRect.top);
        maxRight = Math.max(maxRight, rect.right - containerRect.left);
        maxBottom = Math.max(maxBottom, rect.bottom - containerRect.top);
        found = true;
      }

      if (found) {
        newRects.push({
          id: prosthesis.id,
          top: minTop - 2,
          left: minLeft - 2,
          width: maxRight - minLeft + 4,
          height: maxBottom - minTop + 4,
        });
      }
    }

    setRects(newRects);
  }, [prostheses, containerRef]);

  useEffect(() => {
    calculateRects();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => calculateRects());
    observer.observe(container);
    return () => observer.disconnect();
  }, [calculateRects, containerRef]);

  return (
    <>
      {rects.map((rect) => (
        <div
          key={rect.id}
          className="pointer-events-none absolute rounded-md border-[2.5px] border-blue-600"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
          }}
        >
          {!readOnly && (
            <button
              onClick={() => onRemove(rect.id)}
              className="pointer-events-auto absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground ring-1 ring-border transition-colors hover:bg-destructive/20 hover:text-destructive"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </>
  );
}
