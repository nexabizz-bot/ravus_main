import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession, sameOrigin, SESSION_COOKIE } from "@/lib/local-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Request origin was not accepted." }, { status: 403 });
  deleteSession((await cookies()).get(SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
