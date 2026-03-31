"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, CalendarPlus } from "lucide-react";
import { Person } from "@/hooks/use-weight-data";
import { formatDateInput } from "@/hooks/use-weight-data";
import { cn } from "@/lib/utils";

interface WeightEntryFormProps {
  people: Person[];
  dates: string[];
  initialPerson?: string;
  onAdd: (name: string, date: string, weight: number) => void;
  onClose: () => void;
}

export function WeightEntryForm({
  people,
  dates,
  initialPerson,
  onAdd,
  onClose,
}: WeightEntryFormProps) {
  const [name, setName] = useState(initialPerson ?? people[0]?.name ?? "");
  const [date, setDate] = useState(dates[dates.length - 1] ?? "");
  const [newDateMode, setNewDateMode] = useState(false);
  const [newDateValue, setNewDateValue] = useState(""); // YYYY-MM-DD from input
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [success, setSuccess] = useState(false);

  const firstFieldRef = useRef<HTMLSelectElement>(null);
  const newDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstFieldRef.current?.focus(); }, []);

  useEffect(() => {
    if (newDateMode) newDateRef.current?.focus();
  }, [newDateMode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Pre-fill existing weight when member/date changes (existing dates only)
  useEffect(() => {
    if (newDateMode) { setWeight(""); return; }
    const person = people.find((p) => p.name === name);
    const entry = person?.data.find((d) => d.date === date);
    setWeight(entry?.weight != null ? String(entry.weight) : "");
    setError("");
  }, [name, date, newDateMode, people]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Resolve the active date
    let activeDate = date;
    if (newDateMode) {
      if (!newDateValue) { setDateError("Pick a date."); return; }
      activeDate = formatDateInput(newDateValue);
      if (dates.includes(activeDate)) {
        setDateError("That session date already exists. Select it from the list.");
        return;
      }
      setDateError("");
    }

    const w = parseFloat(weight);
    if (!weight.trim() || isNaN(w) || w <= 0) {
      setError("Enter a valid weight greater than 0.");
      return;
    }
    if (w > 500) {
      setError("Weight seems too high. Please check the value.");
      return;
    }

    setError("");
    onAdd(name, activeDate, w);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 1200);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-form-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="entry-form-title"
            className="text-lg font-bold text-foreground"
          >
            Add Weight Entry
          </h2>
          <button
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div
            role="status"
            className="flex flex-col items-center gap-2 py-6 text-primary"
          >
            <CheckCircle className="w-10 h-10" aria-hidden="true" />
            <p className="font-semibold text-foreground">Entry saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Member */}
            <div className="space-y-1.5">
              <label
                htmlFor="entry-member"
                className="text-sm font-medium text-foreground"
              >
                Member
              </label>
              <select
                id="entry-member"
                ref={firstFieldRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer transition-colors duration-150"
              >
                {people.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session date */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={newDateMode ? "entry-new-date" : "entry-date"}
                  className="text-sm font-medium text-foreground"
                >
                  Session Date
                </label>
                <button
                  type="button"
                  onClick={() => { setNewDateMode((v) => !v); setDateError(""); }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-pressed={newDateMode}
                >
                  <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  {newDateMode ? "Use existing" : "New date"}
                </button>
              </div>

              {newDateMode ? (
                <>
                  <input
                    ref={newDateRef}
                    id="entry-new-date"
                    type="date"
                    value={newDateValue}
                    onChange={(e) => { setNewDateValue(e.target.value); setDateError(""); }}
                    aria-invalid={!!dateError}
                    aria-describedby={dateError ? "entry-date-error" : undefined}
                    className={cn(
                      "w-full h-11 rounded-lg border bg-background px-3 text-sm text-foreground",
                      "focus:outline-none focus:ring-2 transition-colors duration-150 cursor-pointer",
                      dateError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                    )}
                  />
                  {dateError && (
                    <p id="entry-date-error" role="alert" className="text-xs text-destructive">
                      {dateError}
                    </p>
                  )}
                </>
              ) : (
                <select
                  id="entry-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer transition-colors duration-150"
                >
                  {dates.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label
                htmlFor="entry-weight"
                className="text-sm font-medium text-foreground"
              >
                Weight (kg)
              </label>
              <input
                id="entry-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                max="500"
                placeholder="e.g. 65.5"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setError("");
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "entry-weight-error" : undefined}
                className={cn(
                  "w-full h-11 rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 transition-colors duration-150",
                  error
                    ? "border-destructive focus:ring-destructive"
                    : "border-input focus:ring-ring"
                )}
              />
              {error && (
                <p
                  id="entry-weight-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Save Entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
