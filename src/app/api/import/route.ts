import { NextRequest, NextResponse } from "next/server";
import { importStore, readStore } from "@/lib/store.server";

interface Person {
  name: string;
  id?: string | null;
  handle?: string | null;
  colorIndex?: number | null;
  data: Array<{ date: string; weight: number | null }>;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { people } = body ?? {};

  if (!Array.isArray(people) || people.length === 0) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Basic validation
  for (const p of people) {
    if (typeof p.name !== "string" || !p.name.trim()) {
      return NextResponse.json({ error: "Invalid member name" }, { status: 400 });
    }
    if (!Array.isArray(p.data)) {
      return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
    }
  }

  await importStore(people as Person[]);
  const store = await readStore();
  return NextResponse.json(store);
}
