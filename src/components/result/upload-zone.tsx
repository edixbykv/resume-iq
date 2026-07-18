"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

export function UploadZone({
  onAnalyze,
  loading,
  error,
}: {
  onAnalyze: (payload: { file?: File; text?: string }) => void;
  loading: boolean;
  error?: string | null;
}) {
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    onAnalyze({ file });
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex justify-center gap-1 rounded-xl bg-muted p-1">
        <button
          onClick={() => setMode("file")}
          className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all", mode === "file" ? "bg-background shadow-sm" : "text-muted-foreground")}
        >
          Upload file
        </button>
        <button
          onClick={() => setMode("paste")}
          className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all", mode === "paste" ? "bg-background shadow-sm" : "text-muted-foreground")}
        >
          Paste text
        </button>
      </div>

      {mode === "file" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => !loading && inputRef.current?.click()}
          className={cn(
            "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all sm:p-14",
            drag ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/30",
            loading && "pointer-events-none opacity-70",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
          />
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            {loading ? <Loader2 className="size-7 animate-spin" /> : <UploadCloud className="size-7" />}
          </div>
          <h3 className="mt-5 text-lg font-semibold">
            {loading ? "Analyzing your resume…" : "Drop your resume here"}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {loading ? "Parsing, scoring & simulating a recruiter" : "or click to browse · PDF or DOCX · max 8MB"}
          </p>
          {fileName && !loading && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
              <FileText className="size-4 text-primary" /> {fileName}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your full resume text here…"
            className="min-h-[260px] font-mono text-xs"
          />
          <Button
            variant="gradient"
            className="w-full"
            disabled={loading || text.trim().length < 40}
            onClick={() => onAnalyze({ text })}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ClipboardPaste className="size-4" />}
            Analyze pasted resume
          </Button>
        </motion.div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
