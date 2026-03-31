"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Person } from "@/data/weight-data";

interface EntriesTableProps {
  person: Person;
}

export function EntriesTable({ person }: EntriesTableProps) {
  // Build rows with computed change from previous recorded weight
  const rows = person.data.map((entry, i) => {
    const prevRecorded = person.data
      .slice(0, i)
      .filter((e) => e.weight !== null);
    const prev =
      prevRecorded.length > 0
        ? prevRecorded[prevRecorded.length - 1].weight
        : null;
    const change =
      entry.weight !== null && prev !== null
        ? +(entry.weight - prev).toFixed(1)
        : null;
    return { ...entry, change };
  });

  const recorded = rows.filter((r) => r.weight !== null).length;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">All Entries</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {person.name} &middot; {recorded} of {rows.length} sessions recorded
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label={`Weight entries for ${person.name}`}>
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th
                scope="col"
                className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Date
              </th>
              <th
                scope="col"
                className="text-right px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Weight
              </th>
              <th
                scope="col"
                className="text-right px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.date}
                className={`border-b border-border last:border-0 ${
                  i % 2 !== 0 ? "bg-muted/20" : ""
                }`}
              >
                <td className="px-5 py-3 text-foreground tabular-nums">
                  {row.date}
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-medium">
                  {row.weight !== null ? (
                    `${row.weight} kg`
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {row.change === null ? (
                    <span className="text-muted-foreground tabular-nums">—</span>
                  ) : row.change > 0 ? (
                    <span className="inline-flex items-center justify-end gap-1 text-rose-500 text-xs font-medium tabular-nums">
                      <TrendingUp className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      +{row.change} kg
                    </span>
                  ) : row.change < 0 ? (
                    <span className="inline-flex items-center justify-end gap-1 text-emerald-600 text-xs font-medium tabular-nums">
                      <TrendingDown className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      {row.change} kg
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-end gap-1 text-muted-foreground text-xs font-medium tabular-nums">
                      <Minus className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      0 kg
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No sessions yet.
          </div>
        )}
      </div>
    </div>
  );
}
