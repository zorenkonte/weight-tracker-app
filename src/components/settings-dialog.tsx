"use client";

import { useRef, useState } from "react";
import { X, Upload, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Person } from "@/hooks/use-weight-data";
import * as XLSX from "xlsx";

interface SettingsDialogProps {
  onClose: () => void;
  onImported: (people: Person[]) => void;
  onReset: () => void;
}

type Step = "idle" | "preview" | "importing" | "done";

function parseSheet(workbook: XLSX.WorkBook): Person[] | null {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
  if (!rows.length) return null;

  const header = rows[0].map((h) => String(h ?? "").trim());
  const nameIdx = header.findIndex((h) => h.toLowerCase() === "name");

  // Wide format: Name | date1 | date2 ...
  if (nameIdx !== -1) {
    const dateCols = header
      .map((h, i) => ({ h, i }))
      .filter(({ i }) => i !== nameIdx);

    return rows.slice(1).map((row) => ({
      name: String(row[nameIdx] ?? "").trim().toUpperCase(),
      data: dateCols.map(({ h, i }) => ({
        date: h,
        weight: row[i] != null && row[i] !== "" ? parseFloat(String(row[i])) || null : null,
      })),
    })).filter((p) => p.name);
  }

  return null;
}

export function SettingsDialog({ onClose, onImported, onReset }: SettingsDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("idle");
  const [preview, setPreview] = useState<Person[] | null>(null);
  const [parseError, setParseError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [importing, setImporting] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const wb = XLSX.read(data, { type: "binary" });
        const people = parseSheet(wb);
        if (!people || people.length === 0) {
          setParseError(
            "Could not parse file. Expected a 'Name' column followed by date columns."
          );
          return;
        }
        setPreview(people);
        setStep("preview");
      } catch {
        setParseError("Failed to read file. Make sure it is a valid CSV or Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: preview }),
      });
      if (res.ok) {
        const { people } = await res.json();
        onImported(people);
        setStep("done");
      } else {
        setParseError("Import failed. Please try again.");
        setImporting(false);
      }
    } catch {
      setParseError("Import failed. Please check your connection.");
      setImporting(false);
    }
  }

  async function handleReset() {
    await fetch("/api/members", { method: "DELETE" });
    onReset();
    setResetDone(true);
    setConfirmReset(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-bold text-foreground">
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Import section */}
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Import Data</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a CSV or Excel (.xlsx) file. First row must have a{" "}
              <strong>Name</strong> column, with date columns after it (e.g.{" "}
              <code className="bg-muted px-1 rounded text-xs">1/16/2026</code>).
            </p>
          </div>

          {step === "idle" && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground hover:bg-muted/60 hover:border-primary/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full justify-center"
              >
                <Upload className="w-4 h-4" />
                Choose file (CSV or XLSX)
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="sr-only"
                onChange={handleFile}
              />
              {parseError && (
                <p className="text-xs text-destructive">{parseError}</p>
              )}
            </>
          )}

          {step === "preview" && preview && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/40 px-3 py-2 border-b border-border">
                  <p className="text-xs font-medium text-foreground">
                    Preview — {preview.length} members, {preview[0]?.data.length ?? 0} sessions
                  </p>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {preview.slice(0, 8).map((p) => {
                    const recorded = p.data.filter((d) => d.weight !== null).length;
                    return (
                      <div
                        key={p.name}
                        className="flex items-center justify-between px-3 py-2 text-sm border-b border-border last:border-0"
                      >
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {recorded}/{p.data.length} entries
                        </span>
                      </div>
                    );
                  })}
                  {preview.length > 8 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      +{preview.length - 8} more…
                    </div>
                  )}
                </div>
              </div>
              {parseError && (
                <p className="text-xs text-destructive">{parseError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep("idle"); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="flex-1 h-10 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {importing ? "Importing…" : "Import & Replace"}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Import complete — data updated.
            </div>
          )}
        </section>

        <hr className="border-border" />

        {/* Danger zone */}
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete all members and entries.
            </p>
          </div>

          {resetDone ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              All data cleared.
            </div>
          ) : confirmReset ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>This will delete all members and weight entries. This cannot be undone.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 h-9 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Yes, delete all
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className={cn(
                "flex items-center gap-2 h-10 px-4 rounded-lg border border-destructive/40 text-sm text-destructive",
                "hover:bg-destructive/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <Trash2 className="w-4 h-4" />
              Start fresh (delete all data)
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
