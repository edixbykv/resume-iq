import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <img src="/logo-symbol.png" alt="ResumeIQ Logo" className="h-8 w-auto object-contain" />
      <span className="text-lg font-bold tracking-tight text-foreground">
        Resume<span className="text-primary">IQ</span>
      </span>
    </span>
  );
}
