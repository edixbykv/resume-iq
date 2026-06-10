"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="no-print sticky top-0 z-50 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
            <Link href="/analyze">
              <Sparkles className="size-4" /> Analyze Resume
            </Link>
          </Button>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
                {l.label}
              </Link>
            ))}
            <Button asChild variant="gradient" className="mt-2">
              <Link href="/analyze" onClick={() => setOpen(false)}>
                <Sparkles className="size-4" /> Analyze Resume
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
