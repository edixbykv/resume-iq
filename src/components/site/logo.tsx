import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-600 via-primary to-indigo-600 text-white shadow-md shadow-primary/30">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4z" />
          <path d="M14 4v6h6" />
          <path d="M8 14l2 2 4-4" />
        </svg>
      </span>
      <span className="text-base">
        Resume<span className="text-primary">IQ</span>
      </span>
    </span>
  );
}
