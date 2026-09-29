import { NextResponse } from "next/server";
import { createSession, createUser, normalizeEmail, sameOrigin, SESSION_COOKIE, SESSION_SECONDS, validEmail, validPassword } from "@/lib/local-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Request origin was not accepted." }, { status: 403 });
  try {
    const { name: rawName, email: rawEmail, password } = await request.json();
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const email = typeof rawEmail === "string" ? normalizeEmail(rawEmail) : "";
    if (name.length < 2 || name.length > 80 || !validEmail(email) || typeof password !== "string" || !validPassword(password)) {
      return Response.json({ error: "Use a name, valid email, and a password of 10–128 characters with a letter and number." }, { status: 400 });
    }
    const user = createUser(name, email, password);
    if (!user) return Response.json({ error: "An account with this email already exists. Log in instead." }, { status: 409 });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSession(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS });
    return response;
  } catch {
    return Response.json({ error: "Could not create your account. Please try again." }, { status: 400 });
  }
}
