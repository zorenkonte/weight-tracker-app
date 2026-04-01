"use client";

import { useState } from "react";
import { X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Person } from "@/hooks/use-weight-data";
import { AVATAR_PALETTE, getAvatarColor } from "@/lib/avatar-store";

interface MemberProfileDialogProps {
  person: Person;
  defaultIndex: number;
  people: Person[];
  onClose: () => void;
  onSaved: (oldName: string, newName: string) => void;
}

export function MemberProfileDialog({
  person,
  defaultIndex,
  people,
  onClose,
  onSaved,
}: MemberProfileDialogProps) {
  const [selectedColor, setSelectedColor] = useState(
    person.colorIndex ?? (defaultIndex % AVATAR_PALETTE.length)
  );
  const [nameValue, setNameValue] = useState(person.name);
  const [handleValue, setHandleValue] = useState(person.handle ?? "");
  const [nameError, setNameError] = useState("");
  const [handleError, setHandleError] = useState("");
  const [saving, setSaving] = useState(false);

  const color = getAvatarColor(selectedColor, defaultIndex);
  const initials = nameValue.trim().slice(0, 2).toUpperCase() || person.name.slice(0, 2);

  async function handleSave() {
    const newName = nameValue.trim().toUpperCase();
    const newHandle = handleValue.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || null;

    if (!newName) {
      setNameError("Name cannot be empty.");
      return;
    }

    if (
      newName !== person.name &&
      people.some((p) => p.name.toLowerCase() === newName.toLowerCase())
    ) {
      setNameError("A member with that name already exists.");
      return;
    }

    if (
      newHandle &&
      newHandle !== (person.handle ?? "").toLowerCase() &&
      people.some((p) => p.handle?.toLowerCase() === newHandle)
    ) {
      setHandleError("That handle is already taken.");
      return;
    }

    setSaving(true);

    const res = await fetch(`/api/members/${encodeURIComponent(person.name)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, colorIndex: selectedColor, handle: newHandle }),
    });

    if (!res.ok) {
      setNameError("Save failed. Try again.");
      setSaving(false);
      return;
    }

    onSaved(person.name, newName);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-dialog-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between">
          <h2 id="profile-dialog-title" className="text-base font-bold text-foreground">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-colors duration-150"
              style={{ backgroundColor: color.hex, color: color.textHex }}
            >
              {initials}
            </div>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-muted-foreground cursor-not-allowed opacity-60"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Profile photo coming soon</p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Avatar Color</p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_PALETTE.map((c, i) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                onClick={() => setSelectedColor(i)}
                className={cn(
                  "w-7 h-7 rounded-full transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                  selectedColor === i
                    ? "ring-2 ring-offset-2 ring-foreground scale-110"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: c.hex }}
                aria-pressed={selectedColor === i}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-name" className="text-xs font-medium text-foreground">
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={nameValue}
            onChange={(e) => {
              setNameValue(e.target.value.toUpperCase());
              setNameError("");
            }}
            className={cn(
              "w-full h-10 rounded-lg border bg-background px-3 text-sm font-medium text-foreground",
              "focus:outline-none focus:ring-2 transition-colors",
              nameError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
            )}
          />
          {nameError && <p role="alert" className="text-xs text-destructive">{nameError}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-handle" className="text-xs font-medium text-foreground">
            Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">@</span>
            <input
              id="profile-handle"
              type="text"
              value={handleValue}
              onChange={(e) => {
                setHandleValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                setHandleError("");
              }}
              placeholder="optional"
              className={cn(
                "w-full h-10 rounded-lg border bg-background pl-7 pr-3 text-sm text-foreground",
                "focus:outline-none focus:ring-2 transition-colors",
                handleError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
              )}
            />
          </div>
          {handleError && <p role="alert" className="text-xs text-destructive">{handleError}</p>}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
