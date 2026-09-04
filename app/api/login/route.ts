import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n-server";

export async function POST(req: Request) {
  const t = getServerDictionary();
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: t.login.invalidRequest }, { status: 400 });
  }

  const result = verifyCredentials(body?.username, body?.password);

  if (result === "not-configured") {
    return NextResponse.json(
      { error: t.login.notConfigured },
      { status: 503 },
    );
  }

  if (result === "invalid") {
    return NextResponse.json(
      { error: t.login.invalidCredentials },
      { status: 401 },
    );
  }

  await createSession(String(body.username).trim());
  return NextResponse.json({ ok: true });
}
