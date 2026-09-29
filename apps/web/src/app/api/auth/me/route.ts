import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE } from "@/lib/local-auth";

export const runtime = "nodejs";

export async function GET() {
  const user = getSessionUser((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) return Response.json({ error: "Not signed in." }, { status: 401 });
  return Response.json({ user });
}
