import { NextRequest, NextResponse } from "next/server";
import { renameMember, deleteMember, readStore } from "@/lib/store.server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: encodedName } = await params;
  const oldName = decodeURIComponent(encodedName);
  const body = await req.json().catch(() => null);
  const { name: newName } = body ?? {};

  if (typeof newName !== "string" || !newName.trim()) {
    return NextResponse.json({ error: "New name is required" }, { status: 400 });
  }

  await renameMember(oldName, newName.trim());
  const store = await readStore();
  return NextResponse.json(store);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);
  await deleteMember(name);
  const store = await readStore();
  return NextResponse.json(store);
}
