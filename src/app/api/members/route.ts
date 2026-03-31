import { NextRequest, NextResponse } from "next/server";
import { addMember, resetStore, readStore } from "@/lib/store.server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name } = body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await addMember(name.trim());
  const store = await readStore();
  return NextResponse.json(store);
}

export async function DELETE() {
  await resetStore();
  return NextResponse.json({ ok: true });
}
