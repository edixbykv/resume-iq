import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-[oklch(0.62_0.17_150)]/12 text-[oklch(0.5_0.17_150)] dark:text-[oklch(0.78_0.16_155)]",
        warning: "border-transparent bg-[oklch(0.74_0.16_75)]/15 text-[oklch(0.5_0.13_70)] dark:text-[oklch(0.82_0.15_80)]",
        destructive: "border-transparent bg-destructive/12 text-destructive",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
