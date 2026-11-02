import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, ADMIN_PASSWORD_PARTS, GUEST_PASSWORD, ITEM_PINS } from "@/lib/server/secrets";

export const dynamic = "force-dynamic";

type VerifyBody =
  | { kind: "password"; value: string }
  | { kind: "pin"; itemId: string; value: string };

export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body?.kind === "password" && typeof body.value === "string") {
    const value = body.value.trim();

    if (value === ADMIN_PASSWORD) {
      return NextResponse.json({
        result: "admin",
        password: ADMIN_PASSWORD,
        parts: ADMIN_PASSWORD_PARTS,
      });
    }
    if (value === GUEST_PASSWORD) {
      return NextResponse.json({ result: "guest" });
    }
    return NextResponse.json({ result: "wrong" });
  }

  if (body?.kind === "pin" && typeof body.itemId === "string" && typeof body.value === "string") {
    const expected = ITEM_PINS[body.itemId];
    return NextResponse.json({ result: expected !== undefined && body.value === expected ? "ok" : "wrong" });
  }

  return NextResponse.json({ error: "invalid_body" }, { status: 400 });
}
