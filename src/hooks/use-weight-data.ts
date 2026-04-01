"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

export interface WeightEntry {
  date: string;
  weight: number | null;
}

export interface Person {
  name: string;
  id?: string | null;
  handle?: string | null;
  colorIndex?: number | null;
  data: WeightEntry[];
}

/** Returns the URL slug for a member: their id, or name as fallback */
export function memberSlug(person: Person): string {
  if (person.handle) return person.handle;
  return person.id ?? encodeURIComponent(person.name.toLowerCase());
}

function parseMDY(d: string): Date {
  const [m, day, y] = d.split("/").map(Number);
  return new Date(y, m - 1, day);
}

/** Convert <input type="date"> value ("YYYY-MM-DD") → "M/D/YYYY" */
export function formatDateInput(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return `${m}/${d}/${y}`;
}

export function useWeightData(initialPeople: Person[] = []) {
  const [people, setPeople] = useState<Person[]>(initialPeople);

  // Sync when server re-renders with fresh data (e.g. after router.refresh())
  useEffect(() => {
    setPeople(initialPeople);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialPeople)]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/entries");
      if (res.ok) {
        const { people: data } = await res.json();
        setPeople(data);
      }
    } catch {
      // Network error — keep current state
    }
  }, []);

  /** All unique session dates across all members, sorted chronologically */
  const dates = useMemo<string[]>(() => {
    const all = new Set(people.flatMap((p) => p.data.map((d) => d.date)));
    return [...all].sort(
      (a, b) => parseMDY(a).getTime() - parseMDY(b).getTime()
    );
  }, [people]);

  /**
   * Add or update a weight entry.
   * Applies an optimistic update immediately, then syncs with the server.
   * On failure, reverts by reloading server state.
   */
  async function addEntry(name: string, date: string, weight: number) {
    const isNewDate = !dates.includes(date);

    // Optimistic update
    setPeople((prev) =>
      prev.map((p) => {
        let data = p.data;
        if (isNewDate && !data.some((d) => d.date === date)) {
          data = [...data, { date, weight: null }].sort(
            (a, b) => parseMDY(a.date).getTime() - parseMDY(b.date).getTime()
          );
        }
        if (p.name !== name) return { ...p, data };
        return {
          ...p,
          data: data.map((d) => (d.date === date ? { ...d, weight } : d)),
        };
      })
    );

    // Persist to server
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, weight }),
      });
      if (res.ok) {
        const { people: updated } = await res.json();
        setPeople(updated);
      } else {
        await load(); // revert
      }
    } catch {
      await load(); // revert on network error
    }
  }

  return { people, dates, addEntry };
}
