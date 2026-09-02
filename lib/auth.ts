import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "kasturi_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("Missing SESSION_SECRET");
  return new TextEncoder().encode(s);
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ username: string } | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { username: payload.username as string };
  } catch {
    return null;
  }
}

export function verifyCredentials(username: string, password: string) {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  return Boolean(u && p && username === u && password === p);
}
