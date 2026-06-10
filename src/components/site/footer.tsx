import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="no-print border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              AI-powered career intelligence. Score your resume, simulate a recruiter,
              match jobs, and build a 90-day plan to get hired faster.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/analyze" className="hover:text-foreground">Resume Analyzer</Link></li>
              <li><Link href="/#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="https://kvai.in" className="hover:text-foreground">KVAI Solutions</a></li>
              <li><Link href="/#how" className="hover:text-foreground">How it works</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ResumeIQ. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with care by{" "}
            <a href="https://kvai.in" className="font-semibold text-foreground hover:text-primary">
              KVAI Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
