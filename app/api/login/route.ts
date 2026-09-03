import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = verifyCredentials(body?.username, body?.password);

  if (result === "not-configured") {
    return NextResponse.json(
      { error: "Login is not configured on the server. Contact the administrator." },
      { status: 503 },
    );
  }

  if (result === "invalid") {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  await createSession(String(body.username).trim());
  return NextResponse.json({ ok: true });
}
