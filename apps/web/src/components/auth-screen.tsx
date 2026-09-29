"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./auth.module.css";

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const signingUp = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${signingUp ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please try again.");
      router.push("/account");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      setPending(false);
    }
  }

  return <main className={styles.authPage}>
    <div className={styles.authShell}>
      <section className={styles.formSide}>
        <div className={styles.authTop}><BrandLogo /><Link className={styles.back} href="/"><ArrowLeft size={15} /> Back to site</Link></div>
        <div className={styles.formCenter}>
          <span className={styles.kicker}><Sparkles size={15} /> YOUR GROWTH WORKSPACE</span>
          <h1>{signingUp ? <>Make room for<br /><em>what’s next.</em></> : <>Welcome back<br /><em>to Ravus.</em></>}</h1>
          <p>{signingUp ? "Create your account to shape a brand profile, review creative, and keep the path from click to booking in one place." : "Your campaigns, approvals, and customer journey are ready when you are."}</p>
          <form className={styles.form} onSubmit={submit}>
            {signingUp && <label>Full name<input name="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" minLength={2} maxLength={80} required /></label>}
            <label>Email address<input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@business.com" required /></label>
            <label>Password<span className={styles.passwordField}><input name="password" type={showPassword ? "text" : "password"} autoComplete={signingUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={signingUp ? "At least 10 characters" : "Enter your password"} minLength={signingUp ? 10 : undefined} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            {signingUp && <span className={styles.hint}>Use 10 or more characters with a letter and a number.</span>}
            {error && <div className={styles.error} role="alert">{error}</div>}
            <button className={styles.submit} type="submit" disabled={pending}>{pending ? "One moment…" : signingUp ? "Create account" : "Log in"}<ArrowRight size={17} /></button>
          </form>
          <div className={styles.switch}>{signingUp ? "Already have an account?" : "New to Ravus?"} <Link href={signingUp ? "/login" : "/signup"}>{signingUp ? "Log in" : "Create an account"}</Link></div>
          <div className={styles.assurance}><LockKeyhole size={15} /> Your account stays private. Creative and campaign actions still need your approval.</div>
        </div>
        <span className={styles.formFoot}>© {new Date().getFullYear()} Ravus</span>
      </section>
      <aside className={styles.visualSide} aria-label="Ravus creative workspace preview">
        <div className={styles.visualGrid} />
        <Image src="/images/hero-signal-silver.webp" alt="Glossy black signal sculpture with luminous silver paths" fill priority sizes="(max-width: 850px) 100vw, 46vw" />
        <div className={styles.visualOverlay} />
        <div className={styles.visualTop}><span className={styles.liveDot} /> FROM WEBSITE TO BOOKED CUSTOMER</div>
        <div className={styles.visualCopy}><span>THE RAVUS EXPERIENCE</span><h2>Ideas you can see.<br />Decisions you control.</h2><p>Scan your business, shape your next campaign, and review every move before it reaches a customer.</p><div><span><ShieldCheck size={15} /> Approval first</span><span><Sparkles size={15} /> Built for your brand</span></div></div>
      </aside>
    </div>
  </main>;
}
