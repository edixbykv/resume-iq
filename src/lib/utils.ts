import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number into the [min, max] range. */
export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/** Round to a whole number, clamped 0-100 for scores. */
export function asScore(value: number) {
  return Math.round(clamp(value, 0, 100));
}

export function pct(value: number) {
  return `${Math.round(value)}%`;
}
