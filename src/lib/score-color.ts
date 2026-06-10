/** Shared score → color mapping used across all visualizations. */
export function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-500", bg: "bg-emerald-500", stroke: "#10b981", label: "Excellent" };
  if (score >= 65) return { text: "text-violet-500", bg: "bg-violet-500", stroke: "#8b5cf6", label: "Good" };
  if (score >= 50) return { text: "text-amber-500", bg: "bg-amber-500", stroke: "#f59e0b", label: "Fair" };
  return { text: "text-rose-500", bg: "bg-rose-500", stroke: "#f43f5e", label: "Needs Work" };
}

export function scoreIndicatorClass(score: number) {
  if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-green-400";
  if (score >= 65) return "bg-gradient-to-r from-violet-500 to-indigo-400";
  if (score >= 50) return "bg-gradient-to-r from-amber-500 to-yellow-400";
  return "bg-gradient-to-r from-rose-500 to-red-400";
}
