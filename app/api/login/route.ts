import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }
  await createSession(username);
  return NextResponse.json({ ok: true });
}
