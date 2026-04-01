"use client";

import { useRef, useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Pencil,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { Person } from "@/hooks/use-weight-data";
import { AVATAR_PALETTE, getAvatarColor } from "@/lib/avatar-store";
import { MemberProfileDialog } from "@/components/member-profile-dialog";

// ─── Import helpers ───────────────────────────────────────────────────────────

function parseSheet(workbook: XLSX.WorkBook): Person[] | null {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
  if (!rows.length) return null;
  const header = rows[0].map((h) => String(h ?? "").trim());
  const nameIdx = header.findIndex((h) => h.toLowerCase() === "name");
  if (nameIdx !== -1) {
    const dateCols = header.map((h, i) => ({ h, i })).filter(({ i }) => i !== nameIdx);
    return rows
      .slice(1)
      .map((row) => ({
        name: String(row[nameIdx] ?? "").trim().toUpperCase(),
        data: dateCols.map(({ h, i }) => ({
          date: h,
          weight: row[i] != null && row[i] !== "" ? parseFloat(String(row[i])) || null : null,
        })),
      }))
      .filter((p) => p.name);
  }
  return null;
}

// ─── Kebab Menu ───────────────────────────────────────────────────────────────

function KebabMenu({
  onEdit,
  onDelete,
  name,
}: {
  onEdit: () => void;
  onDelete: () => void;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="group size-8 flex items-center justify-center rounded-md text-muted-foreground hover:border hover:border-border hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreHorizontal className="size-4 shrink-0" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-9 z-20 min-w-[148px] rounded-lg border border-border bg-card shadow-md py-1"
        >
          <button
            role="menuitem"
            onClick={() => { onEdit(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit profile
          </button>
          <button
            role="menuitem"
            onClick={() => { onDelete(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────

function AddMemberModal({
  people,
  onAdded,
  onClose,
}: {
  people: Person[];
  onAdded: (people: Person[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [nameError, setNameError] = useState("");
  const [handleError, setHandleError] = useState("");
  const [saving, setSaving] = useState(false);

  const avatarPreview = getAvatarColor(colorIndex, colorIndex);
  const initials = name.trim().slice(0, 2).toUpperCase() || "?";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim().toUpperCase();
    const trimmedHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || null;

    if (!trimmedName) { setNameError("Name is required."); return; }
    if (people.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setNameError("A member with that name already exists."); return;
    }
    if (trimmedHandle && people.some((p) => p.handle?.toLowerCase() === trimmedHandle)) {
      setHandleError("That handle is already taken."); return;
    }

    setSaving(true);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, colorIndex, handle: trimmedHandle }),
    });
    if (res.ok) {
      const { people: updated } = await res.json();
      onAdded(updated);
      onClose();
    } else {
      setNameError("Failed to add member. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="add-member-title" className="text-base font-semibold text-foreground">
            Add member
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="size-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{ backgroundColor: avatarPreview.hex, color: avatarPreview.textHex }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Color</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PALETTE.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    title={c.label}
                    onClick={() => setColorIndex(i)}
                    className={cn(
                      "size-5 rounded-full transition-all cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      colorIndex === i ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: c.hex }}
                    aria-pressed={colorIndex === i}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="add-name" className="text-sm font-medium text-foreground">
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id="add-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value.toUpperCase()); setNameError(""); }}
              placeholder="e.g. ALEX"
              autoComplete="off"
              className={cn(
                "w-full h-9 rounded-lg border bg-background px-3 text-sm text-foreground",
                "focus:outline-none focus:ring-2 transition-colors",
                nameError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
              )}
            />
            {nameError && <p role="alert" className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="add-handle" className="text-sm font-medium text-foreground">
              Handle <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">@</span>
              <input
                id="add-handle"
                type="text"
                value={handle}
                onChange={(e) => { setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setHandleError(""); }}
                placeholder="optional"
                autoComplete="off"
                className={cn(
                  "w-full h-9 rounded-lg border bg-background pl-7 pr-3 text-sm text-foreground",
                  "focus:outline-none focus:ring-2 transition-colors",
                  handleError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                )}
              />
            </div>
            {handleError && <p role="alert" className="text-xs text-destructive">{handleError}</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {saving ? "Adding…" : "Add member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Members Section ──────────────────────────────────────────────────────────

function MembersSection({
  people,
  onUpdated,
}: {
  people: Person[];
  onUpdated: (people: Person[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<{ person: Person; index: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(name: string) {
    setDeleting(name);
    const res = await fetch(`/api/members/${encodeURIComponent(name)}`, { method: "DELETE" });
    if (res.ok) onUpdated(people.filter((p) => p.name !== name));
    setDeleting(null);
    setConfirmDelete(null);
  }

  return (
    <>
      <section aria-labelledby="members-heading">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 id="members-heading" className="scroll-mt-10 font-semibold text-foreground">
              Members
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Workspace administrators can add, manage, and remove members.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 sm:mt-0 sm:w-fit h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="-ml-1 size-4 shrink-0" aria-hidden="true" />
            Add member
          </button>
        </div>

        {people.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No members yet. Add someone to get started.
          </div>
        ) : (
          <ul role="list" className="mt-6 divide-y divide-border">
            {people.map((person, i) => {
              const color = getAvatarColor(person.colorIndex, i);
              const isConfirming = confirmDelete === person.name;
              const isDeleting = deleting === person.name;
              return (
                <li key={person.name} className="flex items-center justify-between gap-x-6 py-2.5">
                  <div className="flex items-center gap-x-4 truncate">
                    <span
                      className="hidden size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:flex"
                      style={{ backgroundColor: color.hex, color: color.textHex }}
                      aria-hidden="true"
                    >
                      {person.name.slice(0, 2)}
                    </span>
                    <div className="truncate">
                      <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person.handle ? `@${person.handle}` : <span className="italic opacity-50">no handle</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isConfirming ? (
                      <>
                        <span className="text-xs text-destructive font-medium">Remove?</span>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs h-7 px-2.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(person.name)}
                          disabled={isDeleting}
                          className="text-xs h-7 px-2.5 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
                        >
                          {isDeleting ? "…" : "Yes"}
                        </button>
                      </>
                    ) : (
                      <KebabMenu
                        name={person.name}
                        onEdit={() => setEditing({ person, index: i })}
                        onDelete={() => setConfirmDelete(person.name)}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {showAdd && (
        <AddMemberModal
          people={people}
          onAdded={onUpdated}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <MemberProfileDialog
          person={editing.person}
          defaultIndex={editing.index}
          people={people}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            const res = await fetch("/api/entries");
            if (res.ok) {
              const { people: updated } = await res.json();
              onUpdated(updated);
            }
          }}
        />
      )}
    </>
  );
}

// ─── Import Section ───────────────────────────────────────────────────────────

type ImportStep = "idle" | "preview" | "importing" | "done";

function ImportSection({ onImported }: { onImported: (people: Person[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>("idle");
  const [preview, setPreview] = useState<Person[] | null>(null);
  const [parseError, setParseError] = useState("");
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
          setParseError("Could not parse file. Expected a 'Name' column followed by date columns.");
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

  return (
    <section aria-labelledby="import-heading">
      <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
        <div>
          <h3 id="import-heading" className="scroll-mt-10 font-semibold text-foreground">
            Import data
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Bulk-import members and weight entries from a spreadsheet.
          </p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Upload a CSV or Excel (.xlsx) file. First row must have a{" "}
            <strong className="font-medium text-foreground">Name</strong> column, followed by date columns
            (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-xs">1/16/2026</code>).{" "}
            <span className="font-medium text-destructive">This replaces all existing data.</span>
          </p>

          {step === "idle" && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 h-9 px-4 rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Upload className="size-4" aria-hidden="true" />
                Choose file (CSV or XLSX)
              </button>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={handleFile} />
              {parseError && <p className="text-xs text-destructive">{parseError}</p>}
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
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {preview.slice(0, 10).map((p) => (
                    <div key={p.name} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.data.filter((d) => d.weight !== null).length}/{p.data.length} entries
                      </span>
                    </div>
                  ))}
                  {preview.length > 10 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">+{preview.length - 10} more…</div>
                  )}
                </div>
              </div>
              {parseError && <p className="text-xs text-destructive">{parseError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep("idle"); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {importing ? "Importing…" : "Import & Replace"}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle className="size-4" aria-hidden="true" />
              Import complete — data updated.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Danger Zone ──────────────────────────────────────────────────────────────

function DangerSection({ onReset }: { onReset: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  async function handleReset() {
    await fetch("/api/members", { method: "DELETE" });
    onReset();
    setResetDone(true);
    setConfirmReset(false);
  }

  return (
    <section aria-labelledby="danger-heading">
      <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
        <div>
          <h3 id="danger-heading" className="scroll-mt-10 font-semibold text-foreground">
            Danger zone
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Manage data deletion. These actions cannot be undone.
          </p>
        </div>
        <div className="space-y-4 md:col-span-2">
          {resetDone ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle className="size-4" aria-hidden="true" />
                All data has been cleared.
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-10">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Delete all data</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Permanently remove all members and their weight entries from the workspace.
                    </p>
                  </div>
                  {!confirmReset && (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="shrink-0 h-8 px-3 rounded-lg border border-destructive/40 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {confirmReset && (
                  <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <div className="flex items-start gap-2 text-sm text-destructive">
                      <AlertTriangle className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>This will permanently delete all members and entries. There is no undo.</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="flex-1 h-8 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 h-8 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        Yes, delete all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-start justify-between gap-10 p-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground/50">Restore from backup</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground/50">
                      Restore data from a previous backup point.
                    </p>
                  </div>
                  <button
                    disabled
                    className="shrink-0 h-8 px-3 rounded-lg border border-border text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
                  >
                    Restore
                  </button>
                </div>
                <div className="border-t border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Backups are not yet available in this version.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Settings Page Client ─────────────────────────────────────────────────────

export function MembersSectionPage({ initialPeople }: { initialPeople: Person[] }) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  return <MembersSection people={people} onUpdated={setPeople} />;
}

export function ImportSectionPage() {
  const router = useRouter();
  return (
    <ImportSection
      onImported={() => { router.refresh(); }}
    />
  );
}

export function DangerSectionPage() {
  const router = useRouter();
  return (
    <DangerSection onReset={() => { router.refresh(); }} />
  );
}

