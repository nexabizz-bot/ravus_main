"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleCheck, Globe2, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./auth.module.css";

export function AccountHome({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }
  return <main className={styles.accountPage}>
    <header className={styles.accountHeader}><BrandLogo /><div><span>{email}</span><button type="button" onClick={logout}><LogOut size={15} /> Log out</button></div></header>
    <div className={styles.accountInner}>
      <span className={styles.kicker}><CircleCheck size={15} /> YOUR RAVUS ACCOUNT</span>
      <h1>Good to have you here,<br /><em>{name.split(" ")[0]}.</em></h1>
      <p className={styles.accountIntro}>Your account is ready. Start with a website scan, then explore how creative, approvals, and bookings fit together.</p>
      <div className={styles.accountCards}>
        <Link href="/#website-scan" className={styles.accountCard}><Globe2 size={23} /><span>01 / START HERE</span><strong>Scan a website</strong><p>Turn public website details into an editable brand starting point.</p><i><ArrowRight size={18} /></i></Link>
        <Link href="/#platform" className={styles.accountCard}><Sparkles size={23} /><span>02 / EXPLORE</span><strong>Creative studio</strong><p>See original campaign visuals and switch between draft directions.</p><i><ArrowRight size={18} /></i></Link>
        <Link href="/#results" className={styles.accountCard}><ShieldCheck size={23} /><span>03 / STAY IN CONTROL</span><strong>Review the journey</strong><p>Follow suggestions and outcomes before making a move.</p><i><ArrowRight size={18} /></i></Link>
      </div>
      <div className={styles.accountFeature}><div><span>BUILT FOR THE FULL JOURNEY</span><h2>From a first idea to a real booking.</h2><p>Ravus keeps the brand, creative, campaign, conversation, and outcome connected in one clear path.</p><Link href="/#how-it-works">See how it works <ArrowRight size={16} /></Link></div><div className={styles.accountImage}><Image src="/images/canvas-care-greeting-neutral.webp" alt="Local dental clinician greeting a customer" fill sizes="(max-width: 720px) 100vw, 36vw" /></div></div>
      <p className={styles.accountNote}>This local account stores your sign-in only. Product workspaces and saved campaigns are a later stage of the platform.</p>
    </div>
  </main>;
}
