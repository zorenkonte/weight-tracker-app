import { NextRequest, NextResponse } from "next/server";
import { addMember, resetStore, readStore, saveMemberMeta } from "@/lib/store.server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, colorIndex, handle } = body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trimmedName = name.trim().toUpperCase();
  await addMember(trimmedName);

  const normalizedHandle =
    typeof handle === "string" ? handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || null : null;
  const normalizedColorIndex = typeof colorIndex === "number" ? colorIndex : null;

  if (normalizedHandle !== null || normalizedColorIndex !== null) {
    await saveMemberMeta(trimmedName, normalizedColorIndex, normalizedHandle);
  }

  const store = await readStore();
  return NextResponse.json(store);
}

export async function DELETE() {
  await resetStore();
  return NextResponse.json({ ok: true });
}
