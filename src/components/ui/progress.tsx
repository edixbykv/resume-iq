"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Lightweight, color-aware progress bar (0-100). */
export function Progress({
  value = 0,
  className,
  indicatorClassName,
}: {
  value?: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", indicatorClassName)}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
