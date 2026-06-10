"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { scoreColor, scoreIndicatorClass } from "@/lib/score-color";
import { cn } from "@/lib/utils";
import type { ScoreDetail } from "@/lib/engine";

export function SubScoreCard({ detail, index }: { detail: ScoreDetail; index: number }) {
  const [open, setOpen] = useState(false);
  const c = scoreColor(detail.score);
  const hasMore = detail.signals.length > 0 || detail.recommendations.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="overflow-hidden">
        <button
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={() => hasMore && setOpen((o) => !o)}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{detail.label}</span>
              <span className={cn("text-sm font-bold tabular-nums", c.text)}>{detail.score}</span>
            </div>
            <Progress value={detail.score} className="mt-2 h-1.5" indicatorClassName={scoreIndicatorClass(detail.score)} />
            <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{detail.summary}</p>
          </div>
          {hasMore && (
            <ChevronDown className={cn("ml-3 size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/60"
            >
              <div className="space-y-3 p-4">
                {detail.signals.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-emerald-500">What&apos;s working</p>
                    <ul className="space-y-1">
                      {detail.signals.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {detail.recommendations.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-primary">How to improve</p>
                    <ul className="space-y-1">
                      {detail.recommendations.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <Wrench className="mt-0.5 size-3.5 shrink-0 text-primary" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
