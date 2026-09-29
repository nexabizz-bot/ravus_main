import { NextResponse } from "next/server";
import { createSession, normalizeEmail, sameOrigin, SESSION_COOKIE, SESSION_SECONDS, validEmail, verifyUser } from "@/lib/local-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Request origin was not accepted." }, { status: 403 });
  try {
    const { email: rawEmail, password } = await request.json();
    const email = typeof rawEmail === "string" ? normalizeEmail(rawEmail) : "";
    if (!validEmail(email) || typeof password !== "string" || password.length > 128) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const user = verifyUser(email, password);
    if (!user) return Response.json({ error: "Invalid email or password." }, { status: 401 });
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, createSession(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS });
    return response;
  } catch {
    return Response.json({ error: "Could not log in. Please try again." }, { status: 400 });
  }
}
