import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store.server";

interface WeightEntry {
  date: string;
  weight: number | null;
}

function parseMDY(d: string): Date {
  const [m, day, y] = d.split("/").map(Number);
  return new Date(y, m - 1, day);
}

function sortEntries(data: WeightEntry[]): WeightEntry[] {
  return [...data].sort(
    (a, b) => parseMDY(a.date).getTime() - parseMDY(b.date).getTime()
  );
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, date, weight } = body ?? {};

  if (
    typeof name !== "string" ||
    typeof date !== "string" ||
    typeof weight !== "number" ||
    weight <= 0 ||
    weight > 500
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const store = await readStore();

  const existingDates = new Set(
    store.people.flatMap((p) => p.data.map((d) => d.date))
  );
  const isNewDate = !existingDates.has(date);

  store.people = store.people.map((p) => {
    let data = p.data;

    // Ensure every member has a slot for the new date
    if (isNewDate && !data.some((d) => d.date === date)) {
      data = sortEntries([...data, { date, weight: null }]);
    }

    // Write weight only for the target person
    if (p.name !== name) return { ...p, data };
    return {
      ...p,
      data: data.map((d) => (d.date === date ? { ...d, weight } : d)),
    };
  });

  await writeStore(store);
  return NextResponse.json(store);
}
