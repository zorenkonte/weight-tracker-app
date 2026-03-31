"use client";

import { useRouter } from "next/navigation";
import { useWeightData } from "@/hooks/use-weight-data";
import { WeightEntryForm } from "@/components/weight-entry-form";
import { SettingsDialog } from "@/components/settings-dialog";
import { Activity, Plus, TrendingUp, TrendingDown, Minus, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Person } from "@/hooks/use-weight-data";

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-500",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

function MemberCard({
  person,
  colorClass,
  onClick,
}: {
  person: Person;
  colorClass: string;
  onClick: () => void;
}) {
  const recorded = person.data.filter((d) => d.weight !== null);
  const latest = recorded[recorded.length - 1] ?? null;
  const first = recorded[0] ?? null;
  const change =
    latest && first && latest !== first
      ? +(latest.weight! - first.weight!).toFixed(1)
      : null;

  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border border-border bg-card p-4 space-y-3",
        "hover:border-primary/40 hover:shadow-md transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
            colorClass
          )}
          aria-hidden="true"
        >
          {person.name.slice(0, 2)}
        </span>
        <span className="font-semibold text-sm text-foreground truncate">
          {person.name}
        </span>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Latest weight</p>
        <p className="text-2xl font-bold tabular-nums text-foreground leading-tight">
          {latest ? `${latest.weight} kg` : "—"}
        </p>
        {latest && (
          <p className="text-xs text-muted-foreground mt-0.5">{latest.date}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {change === null ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Minus className="w-3 h-3" aria-hidden="true" />
            No change data
          </span>
        ) : isUp ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500">
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
            +{change} kg
          </span>
        ) : isDown ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingDown className="w-3 h-3" aria-hidden="true" />
            {change} kg
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Minus className="w-3 h-3" aria-hidden="true" />
            0 kg
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {recorded.length}/{person.data.length} sessions
        </span>
      </div>
    </button>
  );
}

export function DashboardClient({ initialPeople }: { initialPeople: Person[] }) {
  const { people, dates, addEntry } = useWeightData(initialPeople);
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            Weight Tracker
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              aria-label="Add weight entry"
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {`${people.length} members · ${dates.length} sessions`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {people.map((person, i) => (
            <MemberCard
              key={person.name}
              person={person}
              colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]}
              onClick={() => router.push(`/${encodeURIComponent(person.name.toLowerCase())}`)}
            />
          ))}
        </div>
      </main>

      {showForm && (
        <WeightEntryForm
          people={people}
          dates={dates}
          onAdd={addEntry}
          onClose={() => setShowForm(false)}
        />
      )}
      {showSettings && (
        <SettingsDialog
          onClose={() => setShowSettings(false)}
          onImported={() => { setShowSettings(false); router.refresh(); }}
          onReset={() => { setShowSettings(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
