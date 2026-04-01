import { NextRequest, NextResponse } from "next/server";
import { renameMember, deleteMember, saveMemberMeta, readStore } from "@/lib/store.server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: encodedName } = await params;
  const currentName = decodeURIComponent(encodedName);
  const body = await req.json().catch(() => null);
  const { name: newName, colorIndex, handle } = body ?? {};

  const effectiveName =
    typeof newName === "string" && newName.trim() && newName.trim() !== currentName
      ? newName.trim()
      : currentName;

  if (effectiveName !== currentName) {
    await renameMember(currentName, effectiveName);
  }

  const currentStore = await readStore();
  const member = currentStore.people.find((p) => p.name === effectiveName);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const normalizedHandle =
    handle === undefined
      ? member.handle ?? null
      : typeof handle === "string"
        ? handle.trim().toLowerCase() || null
        : null;

  if (
    normalizedHandle &&
    currentStore.people.some(
      (p) => p.name !== effectiveName && p.handle?.toLowerCase() === normalizedHandle
    )
  ) {
    return NextResponse.json({ error: "Handle already exists" }, { status: 409 });
  }

  const normalizedColorIndex =
    colorIndex === undefined
      ? member.colorIndex ?? null
      : typeof colorIndex === "number"
        ? colorIndex
        : null;

  if (colorIndex !== undefined || handle !== undefined) {
    await saveMemberMeta(effectiveName, normalizedColorIndex, normalizedHandle);
  }

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
