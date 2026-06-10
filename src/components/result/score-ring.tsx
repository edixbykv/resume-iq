"use client";

import { motion } from "framer-motion";
import { scoreColor } from "@/lib/score-color";
import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 160,
  stroke = 12,
  label,
  showGrade,
  className,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  showGrade?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const c = scoreColor(score);
  const offset = circ - (score / 100) * circ;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn("font-bold tabular-nums", c.text)}
          style={{ fontSize: size * 0.28 }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {Math.round(score)}
        </motion.span>
        {showGrade && <span className="text-xs font-semibold text-muted-foreground">Grade {showGrade}</span>}
        {label && <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
