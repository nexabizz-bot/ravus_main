import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountHome } from "@/components/account-home";
import { getSessionUser, SESSION_COOKIE } from "@/lib/local-auth";

export const metadata = { title: "Your account — Ravus" };

export default async function AccountPage() {
  const user = getSessionUser((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) redirect("/login");
  return <AccountHome name={user.name} email={user.email} />;
}
