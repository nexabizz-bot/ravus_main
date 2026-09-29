"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CalendarCheck2,
  Check,
  CheckCheck,
  ChevronDown,
  CircleDollarSign,
  Globe2,
  Layers3,
  Linkedin,
  LockKeyhole,
  Menu,
  MessageCircleMore,
  MousePointer2,
  Facebook,
  Instagram,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
  Youtube,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { AutopilotSection, CreativeCompareSection, SwipeCalendarSection } from "@/components/reference-interactions";
import { IndustryStoriesSection, PlacementSection } from "@/components/showcase-sections";
import { FloatingPet, ScanShowcaseSection, WebsiteScanDialog } from "@/components/scan-experience";
import { PhoneShowcaseSection } from "@/components/phone-showcase";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const GlobeScene = dynamic(() => import("./globe-scene").then((m) => m.GlobeScene), { ssr: false });
const CampaignFlow = dynamic(() => import("./campaign-flow").then((m) => m.CampaignFlow), { ssr: false });
const CreativeCanvas = dynamic(() => import("./creative-canvas").then((m) => m.CreativeCanvas), { ssr: false });

type Metrics = {
  label: string;
  spend: number;
  leads: number;
  conversations: number;
  bookings: number;
  customers: number;
  channels: { name: string; bookings: number; share: number }[];
};

const journey = [
  {
    eyebrow: "01 / IMPORT",
    title: "Paste your website. Meet your new brand brain.",
    body: "Ravus turns your existing site into a reviewable brand profile: services, offers, location, voice, colors, and trust signals.",
  },
  {
    eyebrow: "02 / UNDERSTAND",
    title: "Your brand stays yours, in every draft.",
    body: "Edit the extracted profile once. Campaigns, landing pages, and follow-ups inherit the same versioned source of truth.",
  },
  {
    eyebrow: "03 / CREATE",
    title: "One brief becomes a connected campaign.",
    body: "Generate ad concepts, a landing page, lead form, and a follow-up sequence designed around a real booking goal.",
  },
  {
    eyebrow: "04 / APPROVE",
    title: "You control every external action.",
    body: "Review copy, creative, budget, and timing together. Nothing publishes, spends, or messages a lead until an authorized teammate approves it.",
  },
  {
    eyebrow: "05 / CONVERT",
    title: "Follow the lead all the way to the calendar.",
    body: "See the source, conversation, appointment, and outcome together. Your team knows what to do next and what actually worked.",
  },
];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1250;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  return <span ref={ref} aria-label={value.toLocaleString("en-IN")}>{(reduceMotion ? value : display).toLocaleString("en-IN")}</span>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me").then((response) => { if (response.ok) setSignedIn(true); }).catch(() => {});
  }, []);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <BrandLogo href="#top" />
        <nav className={menuOpen ? "site-nav site-nav-open" : "site-nav"} aria-label="Main navigation">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#results" onClick={() => setMenuOpen(false)}>Results</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link href={signedIn ? "/account" : "/login"} className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>{signedIn ? "Your account" : "Log in"} <ArrowUpRight size={16} /></Link>
          {!signedIn && <Link href="/signup" className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>Sign up <ArrowUpRight size={16} /></Link>}
        </nav>
        <div className="header-actions">
          {!signedIn && <Link href="/login" className="header-login">Log in</Link>}
          <Button asChild size="small"><Link href={signedIn ? "/account" : "/signup"}>{signedIn ? "Account" : "Sign up"} <ArrowUpRight size={16} /></Link></Button>
        </div>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}

function WebsiteForm({ compact = false, onPreview }: { compact?: boolean; onPreview: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    try {
      const value = url.trim();
      const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) throw new Error();
      input?.setCustomValidity("");
      onPreview(parsed.toString());
    } catch {
      input?.setCustomValidity("Enter a public website, like yourbusiness.com.");
      input?.reportValidity();
    }
  };
  return (
    <form className={compact ? "website-form website-form-compact" : "website-form"} onSubmit={onSubmit}>
      <Globe2 size={20} aria-hidden="true" />
      <label className="sr-only" htmlFor={compact ? "footer-url" : "hero-url"}>Your business website</label>
      <input id={compact ? "footer-url" : "hero-url"} type="text" value={url} onChange={(event) => { event.target.setCustomValidity(""); setUrl(event.target.value); }} placeholder="yourbusiness.com" required inputMode="url" />
      <button type="submit" aria-label="Scan website"><ArrowUpRight size={20} /></button>
    </form>
  );
}

function Hero({ onPreview }: { onPreview: (url: string) => void }) {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <section className="hero" id="top">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow hero-glow-left" aria-hidden="true" />
      <div className="hero-glow hero-glow-right" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <Reveal>
            <div className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> AI GROWTH SYSTEM FOR LOCAL BUSINESS</div>
            <h1>From first click<br />to <em className="editorial-accent">booked client.</em></h1>
            <p className="hero-description">Turn your website into campaigns, landing pages, WhatsApp follow-up, and appointments. Every step connected. Every launch approved by you.</p>
            <div className="hero-form-wrap">
              <WebsiteForm onPreview={onPreview} />
              <span className="form-caption"><LockKeyhole size={13} /> Scan a public website. No account or payment needed.</span>
            </div>
            <div className="hero-links">
              <Button asChild variant="secondary" size="large"><a href="#how-it-works"><Play size={16} fill="currentColor" /> Explore the experience</a></Button>
              <a href="#platform" className="text-link">See the platform <ArrowUpRight size={16} /></a>
            </div>
          </Reveal>
        </div>
        <div className="hero-visual" aria-label="Animated illustration of a connected marketing and booking system">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <motion.div className="hero-art-image" animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [-1, 1, -1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
            <Image src="/images/hero-signal-silver.webp" alt="Glossy black signal sculpture with luminous silver paths connecting audience and booking symbols" fill priority sizes="(max-width: 780px) 100vw, 46vw" />
          </motion.div>
          <motion.div className="floating-ui floating-ui-website" animate={reduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
            <span className="mini-icon"><Globe2 size={17} /></span><span><small>INPUT</small><strong>Your website</strong></span><Check size={14} className="green" />
          </motion.div>
          <motion.div className="floating-ui floating-ui-campaign" animate={reduceMotion ? undefined : { y: [0, 9, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
            <span className="mini-icon orange"><Sparkles size={17} /></span><span><small>READY TO REVIEW</small><strong>Campaign draft</strong></span><span className="mini-pill">3 assets</span>
          </motion.div>
          <motion.div className="floating-ui floating-ui-booking" animate={reduceMotion ? undefined : { y: [0, -7, 0] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}>
            <span className="mini-icon amber"><CalendarCheck2 size={17} /></span><span><small>OUTCOME</small><strong>Appointment booked</strong></span><BadgeCheck size={17} className="green" />
          </motion.div>
          <span className="hero-visual-label">ONE SYSTEM <span>·</span> EVERY STEP VISIBLE</span>
        </div>
      </div>
      <a className="scroll-cue" href="#how-it-works"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
    </section>
  );
}

function OutcomeRibbon() {
  const items = [
    { icon: <Globe2 size={17} />, label: "Website" },
    { icon: <Sparkles size={17} />, label: "Campaign" },
    { icon: <MousePointer2 size={17} />, label: "Lead" },
    { icon: <MessageCircleMore size={17} />, label: "Conversation" },
    { icon: <CalendarCheck2 size={17} />, label: "Booking" },
    { icon: <BarChart3 size={17} />, label: "Attribution" },
  ];
  return (
    <div className="outcome-ribbon" aria-label="Connected customer journey">
      <div className="container outcome-inner">
        <span className="outcome-label">THE WHOLE CUSTOMER JOURNEY</span>
        <div className="outcome-items">{items.map((item, index) => <div className="outcome-item" key={item.label}>{item.icon}<span>{item.label}</span>{index < items.length - 1 && <ArrowRight className="outcome-arrow" size={14} />}</div>)}</div>
      </div>
    </div>
  );
}

function JourneyMock({ step, reduceMotion }: { step: number; reduceMotion: boolean }) {
  return (
    <div className="journey-browser">
      <div className="journey-browser-top"><span className="browser-dots"><i /><i /><i /></span><span>workspace / ravus</span><span className="browser-status"><span className="live-dot" /> Draft view</span></div>
      <AnimatePresence mode="wait">
        <motion.div key={step} className="journey-browser-body" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reduceMotion ? 0 : 0.35 }}>
          {step === 0 && <div className="mock-import"><div className="mock-header"><span className="mock-icon"><Globe2 size={23} /></span><div><small>WEBSITE IMPORT</small><h3>One link. A complete starting point.</h3></div></div><div className="mock-url">https://brightviewdental.in <Check size={18} /></div><div className="scan-lines"><span /><span /><span /></div><div className="mock-task"><Check size={16} /> Services and offers found</div><div className="mock-task"><Check size={16} /> Brand colors captured</div><div className="mock-task active"><Sparkles size={16} /> Building your profile</div></div>}
          {step === 1 && <div className="mock-brand"><div className="mock-header"><span className="mock-icon"><Layers3 size={23} /></span><div><small>BRAND PROFILE / SAMPLE</small><h3>Brightview Dental</h3></div></div><div className="brand-swatch-row"><span style={{ background: "#073D4A" }} /><span style={{ background: "#43A8BD" }} /><span style={{ background: "#F2E9D7" }} /><span style={{ background: "#FFFFFF" }} /></div><div className="mock-data-grid"><div><small>VOICE</small><strong>Calm, caring, confident</strong></div><div><small>AUDIENCE</small><strong>Families in Bengaluru</strong></div><div><small>CORE SERVICE</small><strong>Same-week dental care</strong></div><div><small>TRUST SIGNAL</small><strong>4.9★ patient reviews</strong></div></div><div className="mock-footer-line"><Check size={15} /> Editable before generation</div></div>}
          {step === 2 && <div className="mock-campaign"><div className="mock-header"><span className="mock-icon"><WandSparkles size={23} /></span><div><small>CAMPAIGN DRAFT</small><h3>Fill the next 20 appointments</h3></div></div><div className="mock-campaign-grid"><div><span className="mock-card-number">01</span><strong>Meta ads</strong><small>3 creatives · 2 audiences</small><div className="mock-thumbnail"><Image src="/images/showcase-dental.webp" alt="Dental campaign creative" fill sizes="180px" /></div></div><div><span className="mock-card-number">02</span><strong>Landing page</strong><small>Offer + lead form</small><div className="mock-thumbnail"><Image src="/images/clinic-campaign-team-neutral.webp" alt="Clinic team planning their campaign" fill sizes="180px" /></div></div><div><span className="mock-card-number">03</span><strong>Follow-up</strong><small>3 WhatsApp drafts</small><div className="mock-thumbnail"><Image src="/images/studio-booking-neutral.webp" alt="Customer booking at a local studio" fill sizes="180px" /></div></div></div></div>}
          {step === 3 && <div className="mock-approval"><div className="mock-header"><span className="mock-icon"><ShieldCheck size={23} /></span><div><small>APPROVAL INBOX</small><h3>Review before anything goes live.</h3></div></div><div className="approval-preview"><div><small>CAMPAIGN</small><strong>Bright smiles, this week</strong></div><span className="status-pill">Awaiting approval</span></div><div className="approval-row"><span>Daily budget</span><strong>₹1,500 / day</strong></div><div className="approval-row"><span>Channels</span><strong>Meta · Google Ads</strong></div><div className="approval-row"><span>Action</span><strong>Launch after review</strong></div><div className="approval-actions"><span>Request edits</span><span>Approve draft <ArrowRight size={14} /></span></div></div>}
          {step === 4 && <div className="mock-booking"><div className="mock-success"><CalendarCheck2 size={31} /><span>BOOKING CONFIRMED</span><h3>Priya booked a consultation.</h3><p>Tomorrow, 11:30 AM · Brightview Dental</p></div><div className="mock-attribution"><div><small>ORIGIN</small><strong>Google Search → Landing page</strong></div><div><small>CONVERSATION</small><strong>WhatsApp · 4 messages</strong></div><div><small>OWNER</small><strong>Front desk team</strong></div></div></div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 18]);
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (compact) return;
    const next = Math.min(journey.length - 1, Math.floor(Math.max(0, progress) * journey.length));
    setActive((current) => current === next ? current : next);
  });
  return (
    <section className="journey-section" id="how-it-works" ref={sectionRef}>
      <div className="journey-sticky">
        <div className="container journey-layout">
          <div className="journey-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> HOW IT WORKS</div>
            <div className="journey-progress"><span style={{ width: `${((active + 1) / journey.length) * 100}%` }} /></div>
            <AnimatePresence mode="wait"><motion.div key={active} initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reduceMotion ? 0 : 0.35 }}><span className="step-number">{journey[active].eyebrow}</span><h2>{journey[active].title}</h2><p>{journey[active].body}</p></motion.div></AnimatePresence>
            <div className="journey-dots" aria-label="Journey steps">{journey.map((item, index) => <button type="button" key={item.eyebrow} className={index === active ? "active" : ""} aria-label={`Show step ${index + 1}: ${item.title}`} aria-current={index === active ? "step" : undefined} onClick={() => setActive(index)} />)}</div>
          </div>
          <motion.div className="journey-visual" style={reduceMotion ? undefined : { rotateY: orbRotate }}><div className="journey-visual-glow" /><JourneyMock step={active} reduceMotion={reduceMotion} /></motion.div>
        </div>
      </div>
      <div className="journey-scroll-track" aria-hidden="true" />
    </section>
  );
}

function CreativeSection() {
  const [variant, setVariant] = useState<0 | 1>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.25 });
  const reduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = window.setInterval(() => setVariant((current) => current === 0 ? 1 : 0), 5200);
    return () => window.clearInterval(timer);
  }, [inView, reduceMotion]);
  return (
    <section className="feature-section creative-section" id="platform" ref={sectionRef}>
      <div className="container feature-grid">
        <Reveal className="feature-copy"><div className="eyebrow"><span className="eyebrow-dot" /> CREATIVE STUDIO</div><h2>On-brand creative that knows the next step.</h2><p>Generate and refine assets around the service, offer, and action you want a customer to take. Keep versions together and review before use.</p><div className="feature-points"><span><Check size={16} /> Brand profile built in</span><span><Check size={16} /> Edit without losing earlier versions</span><span><Check size={16} /> Placement-ready previews</span></div><div className="template-switch" role="group" aria-label="Creative samples"><button className={variant === 0 ? "active" : ""} onClick={() => setVariant(0)}>Care-led</button><button className={variant === 1 ? "active" : ""} onClick={() => setVariant(1)}>Booking-led</button></div></Reveal>
        <Reveal className="creative-showcase" delay={0.1}><div className="showcase-glow" /><div className="creative-art"><CreativeCanvas variant={variant} /></div><div className="creative-control"><span className="mini-icon orange"><WandSparkles size={17} /></span><span><small>ASK FOR A CHANGE</small><strong>{variant === 0 ? "Make the message more direct" : "Make the offer feel warmer"}</strong></span><ArrowUpRight size={17} /></div><div className="showcase-caption"><span className="live-dot" /> A creative that keeps your brand in view</div></Reveal>
      </div>
    </section>
  );
}

function CampaignSection() {
  return (
    <section className="feature-section campaign-section">
      <div className="container"><Reveal className="section-intro center"><div className="eyebrow"><span className="eyebrow-dot" /> CAMPAIGN STUDIO</div><h2>See the whole campaign.<br /><em className="editorial-accent">Not just the ad.</em></h2><p>A connected view of the creative, landing page, conversation, and booking path before you approve spend.</p></Reveal><Reveal className="campaign-frame"><div className="campaign-frame-top"><div><span className="campaign-breadcrumb">Workspace / Brightview Dental / Campaigns</span><strong>Same-week consultation campaign</strong></div><span className="status-pill">Draft · sample</span></div><CampaignFlow /><div className="campaign-frame-footer"><span><CircleDollarSign size={16} /> Proposed cap: ₹1,500 / day</span><span><ShieldCheck size={16} /> Approval required before launch</span></div></Reveal></div>
    </section>
  );
}

function ApprovalSection() {
  const [decision, setDecision] = useState<"pending" | "approved" | "changes">("pending");
  return (
    <section className="feature-section approval-section">
      <div className="container feature-grid reverse">
        <Reveal className="approval-visual"><div className="approval-card"><div className="approval-card-head"><span className="mini-icon"><ShieldCheck size={20} /></span><div><small>APPROVAL INBOX</small><h3>New campaign ready for review</h3></div><span className="approval-count">01 / 03</span></div><div className="approval-creative"><Image src="/images/clinic-campaign-team-neutral.webp" alt="Clinic team reviewing a campaign together" fill sizes="(max-width: 780px) 100vw, 490px" /><span>CARE THAT FITS<br /><em>YOUR WEEK.</em></span><small>Brightview Dental · Same-week visits</small></div><div className="approval-card-meta"><div><small>BUDGET</small><strong>₹1,500 / day</strong></div><div><small>DESTINATION</small><strong>Booking page</strong></div><div><small>CHANNEL</small><strong>Meta Ads</strong></div></div><div className="approval-card-actions">{decision === "pending" ? <><Button variant="secondary" onClick={() => setDecision("changes")}>Request edits</Button><Button onClick={() => setDecision("approved")}>Approve draft <Check size={17} /></Button></> : <><span className="decision-result">{decision === "approved" ? <><BadgeCheck size={18} /> Approved in sample</> : <><WandSparkles size={18} /> Edit request saved</>}</span><button className="reset-demo" onClick={() => setDecision("pending")}>Reset sample</button></>}</div></div><div className="approval-side-note"><LockKeyhole size={17} /> This sample never publishes or spends.</div></Reveal>
        <Reveal className="feature-copy"><div className="eyebrow"><span className="eyebrow-dot" /> APPROVAL FIRST</div><h2>Your judgment is part of the workflow.</h2><p>Every proposed launch arrives with the creative, destination, budget, and reason in one place. Approve, request edits, or hold it for later.</p><div className="feature-points"><span><Check size={16} /> Clear budget and channel context</span><span><Check size={16} /> Role-based reviewer history</span><span><Check size={16} /> Audit trail for every decision</span></div><span className="interaction-hint"><MousePointer2 size={16} /> Try the sample approval card</span></Reveal>
      </div>
    </section>
  );
}

function ConversionSection() {
  const [replied, setReplied] = useState(false);
  const [booked, setBooked] = useState(false);
  return (
    <section className="conversion-section">
      <div className="container conversion-layout">
        <Reveal className="conversion-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> LEAD CONVERSION</div>
          <h2>The ad is only the beginning.</h2>
          <p>A lead lands in a shared CRM, the right person gets the context, and an opt-in WhatsApp conversation moves toward a real appointment.</p>
          <div className="conversion-chain"><span><MousePointer2 size={17} /> New lead</span><ArrowRight size={15} /><span><MessageCircleMore size={17} /> Conversation</span><ArrowRight size={15} /><span><CalendarCheck2 size={17} /> Booking</span></div>
        </Reveal>
        <Reveal className="conversion-stack" delay={0.12}>
          <div className="lead-card">
            <div className="lead-avatar">P</div>
            <div><small>NEW LEAD · GOOGLE SEARCH</small><strong>Priya Nair</strong><span>Interested in a consultation this week</span></div>
            <span className="lead-score">High intent</span>
          </div>
          <div className="phone-shell" aria-label="Illustrative customer conversation">
            <div className="phone-top">
              <span className="phone-avatar">B</span>
              <span><strong>Brightview Dental</strong><small>WhatsApp conversation · sample</small></span>
              <span className="phone-status"><span /> Available</span>
            </div>
            <div className="chat-area" aria-live="polite">
              <span className="chat-date">TODAY</span>
              <div className="chat-bubble incoming">Hi, do you have any consultation slots this week?</div>
              <div className="chat-bubble outgoing">Hi Priya! We have openings tomorrow at 11:30 AM and Friday at 4:00 PM. Which works for you? <CheckCheck size={13} /></div>
              {replied && <div className="chat-bubble incoming">Tomorrow at 11:30 works. Thanks!</div>}
              {booked && <div className="chat-booking"><CalendarCheck2 size={18} /><span><strong>Consultation booked</strong><small>Tomorrow · 11:30 AM</small></span></div>}
            </div>
            <div className="phone-action">
              <span className="phone-action-label">INTERACTIVE SAMPLE · NO MESSAGE SENT</span>
              {!replied ? <Button size="small" onClick={() => setReplied(true)}>Show sample reply <Send size={14} /></Button> : !booked ? <Button size="small" onClick={() => setBooked(true)}>Confirm sample booking <CalendarCheck2 size={14} /></Button> : <Button variant="secondary" size="small" onClick={() => { setReplied(false); setBooked(false); }}>Restart demo <ArrowRight size={14} /></Button>}
            </div>
          </div>
          <div className="timeline-card"><span className="timeline-icon"><Activity size={17} /></span><span><small>CONNECTED RECORD</small><strong>Campaign → Lead → Chat → Appointment</strong></span></div>
        </Reveal>
      </div>
    </section>
  );
}

function HumanOutcomeSection() {
  return (
    <section className="human-outcome-section">
      <div className="container human-outcome-layout">
        <Reveal className="human-outcome-photo">
          <Image src="/images/cafe-booking-arrival-neutral.webp" alt="Café owner welcoming customers who arrived with a reservation" fill sizes="(max-width: 780px) 100vw, 55vw" />
          <span className="human-photo-label"><span className="live-dot" /> A BOOKING BECOMES A VISIT</span>
        </Reveal>
        <Reveal className="human-outcome-copy" delay={0.12}>
          <div className="eyebrow"><span className="eyebrow-dot" /> MADE FOR REAL BUSINESSES</div>
          <h2>More than a lead.<br /><em className="editorial-accent">A person at your door.</em></h2>
          <p>A click becomes a conversation. A conversation becomes a time on the calendar. Your team sees the whole path and is ready to welcome the customer.</p>
          <div className="human-outcome-record"><span><MessageCircleMore size={18} /> Conversation started</span><ArrowRight size={16} /><span><CalendarCheck2 size={18} /> Visit confirmed</span></div>
        </Reveal>
      </div>
    </section>
  );
}

function AnalyticsSection() {
  const { data } = useQuery<Metrics>({ queryKey: ["demo-metrics"], queryFn: async () => { const response = await fetch("/api/demo/metrics"); if (!response.ok) throw new Error("Could not load sample metrics"); return response.json(); } });
  const metrics = data ?? { label: "Sample workspace data", spend: 4280, leads: 184, conversations: 121, bookings: 48, customers: 19, channels: [{ name: "Meta", bookings: 27, share: 56 }, { name: "Google Ads", bookings: 15, share: 31 }, { name: "Organic", bookings: 6, share: 13 }] };
  return (
    <section className="analytics-section" id="results">
      <div className="container">
        <div className="analytics-feature">
          <Reveal className="analytics-feature-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> ATTRIBUTION & ANALYTICS</div>
            <h2>See where every <em className="editorial-accent">booking begins.</em></h2>
            <p>Connect campaign spend, leads, conversations, and confirmed visits in one clear view.</p>
            <span className="analytics-sample-label">ILLUSTRATIVE WORKSPACE DATA</span>
            <div className="analytics-feature-metrics">
              <div><strong><CountUp value={metrics.leads} /></strong><span>Leads captured</span></div>
              <div><strong><CountUp value={metrics.conversations} /></strong><span>Conversations started</span></div>
              <div><strong><CountUp value={metrics.bookings} /></strong><span>Visits booked</span></div>
              <div><strong><CountUp value={metrics.customers} /></strong><span>New customers</span></div>
            </div>
          </Reveal>
          <Reveal className="analytics-globe-stage" delay={0.12}>
            <div className="analytics-globe-halo" aria-hidden="true" />
            <div className="analytics-globe-canvas" aria-label="Animated dotted globe showing a connected customer journey"><GlobeScene /></div>
            <span className="analytics-globe-caption">ONE CONNECTED CUSTOMER JOURNEY</span>
          </Reveal>
        </div>
        <Reveal className="analytics-dashboard">
          <div className="dashboard-top"><div><span className="campaign-breadcrumb">BRIGHTVIEW DENTAL / PERFORMANCE</span><strong>What is driving appointments?</strong></div><span className="sample-tag">{metrics.label} · ₹{metrics.spend.toLocaleString("en-IN")} sample spend</span></div>
          <div className="dashboard-bottom"><div className="funnel-panel"><span className="panel-label">CONVERSION JOURNEY</span><div className="funnel-row"><span>Leads</span><i style={{ width: "100%" }} /><strong>{metrics.leads}</strong></div><div className="funnel-row"><span>Conversations</span><i style={{ width: "66%" }} /><strong>{metrics.conversations}</strong></div><div className="funnel-row"><span>Bookings</span><i style={{ width: "26%" }} /><strong>{metrics.bookings}</strong></div><div className="funnel-row"><span>Customers</span><i style={{ width: "10%" }} /><strong>{metrics.customers}</strong></div></div><div className="channel-panel"><span className="panel-label">BOOKINGS BY SOURCE</span>{metrics.channels.map((channel) => <div className="channel-row" key={channel.name}><span>{channel.name}</span><div><i style={{ width: `${channel.share}%` }} /></div><strong>{channel.bookings}</strong></div>)}</div></div>
        </Reveal>
      </div>
    </section>
  );
}

function AgencySection() {
  return (
    <section className="agency-section"><div className="container agency-layout"><Reveal><div className="eyebrow"><span className="eyebrow-dot" /> BUILT FOR TEAMS</div><h2>One place for every business you grow.</h2><p>Move between client workspaces, assign the right reviewers, and keep each brand, campaign, lead, and report in its own lane.</p><div className="feature-points"><span><Check size={16} /> Agency-ready client switcher</span><span><Check size={16} /> Roles and approval permissions</span><span><Check size={16} /> Workspace-scoped activity</span></div></Reveal><Reveal className="workspace-panel" delay={0.1}><div className="workspace-panel-top"><span className="workspace-logo">R</span><span><strong>Ravus workspace</strong><small>3 businesses · sample</small></span><ChevronDown size={17} /></div><div className="workspace-row selected"><span className="workspace-avatar"><Image src="/images/showcase-dental.webp" alt="" fill sizes="40px" /></span><span><strong>Brightview Dental</strong><small>12 approvals · 48 bookings</small></span><ArrowUpRight size={17} /></div><div className="workspace-row"><span className="workspace-avatar"><Image src="/images/fitness-session-neutral.webp" alt="" fill sizes="40px" /></span><span><strong>Sunrise Fitness</strong><small>4 approvals · 21 bookings</small></span><ArrowUpRight size={17} /></div><div className="workspace-row"><span className="workspace-avatar"><Image src="/images/showcase-property.webp" alt="" fill sizes="40px" /></span><span><strong>Northside Homes</strong><small>8 approvals · 16 bookings</small></span><ArrowUpRight size={17} /></div><div className="workspace-panel-foot"><ShieldCheck size={15} /> Separate data and permissions per workspace</div></Reveal></div></section>
  );
}

function FAQ() {
  const faqs = [
    ["What does Ravus create?", "Ravus can scan public page metadata and prepare starter campaign copy for review. The full platform is planned to connect creative, landing pages, forms, follow-up, and reporting."],
    ["Will anything launch without approval?", "No. The product architecture requires an authorized approval before publishing, spending, or externally messaging. The controls on this page are frontend samples only."],
    ["Can agencies manage multiple clients?", "Yes. The planned workspace model supports multiple client businesses with separate permissions, assets, leads, and reporting."],
    ["Is WhatsApp connected yet?", "The conversation shown here is an interactive sample. The WhatsApp Business integration, opt-in checks, templates, and webhooks belong to the backend integration phase."],
  ];
  return <section className="faq-section" id="faq"><div className="container faq-grid"><Reveal><div className="eyebrow"><span className="eyebrow-dot" /> QUESTIONS</div><h2>Clear answers.<br /><em>Real control.</em></h2><p>How the experience is designed to work.</p></Reveal><Reveal className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span><ChevronDown size={18} /></span></summary><p>{answer}</p></details>)}</Reveal></div></section>;
}

function Closing({ onPreview }: { onPreview: (url: string) => void }) {
  return <section className="closing-section" id="start"><div className="closing-glow" /><div className="container closing-inner"><Reveal><div className="eyebrow"><span className="eyebrow-dot" /> THE NEXT CUSTOMER STARTS HERE</div><h2>Your website already has<br />a story. <em className="editorial-accent">Let it book.</em></h2><p>Explore how Ravus will turn what you already have into an approval-first path to customers.</p><WebsiteForm compact onPreview={onPreview} /><span className="closing-note">Scan a public website · No signup required</span></Reveal></div></section>;
}

function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(ref, { amount: .38, once: false });
  const visible = reduceMotion || inView;

  return <div className="footer-wordmark" ref={ref} aria-hidden="true">
    <motion.div
      className="footer-wordmark-text"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 115, scale: visible ? 1 : .87 }}
      transition={reduceMotion ? { duration: 0 } : { duration: .85, ease: [.22, 1, .36, 1] }}
    >ravus</motion.div>
  </div>;
}

function Footer() {
  return <footer className="footer">
    <div className="container footer-main">
      <div><BrandLogo href="#top" /><p>Campaigns, conversations, and booked customers in one connected workspace.</p></div>
      <div><strong>Explore</strong><a href="#how-it-works">How it works</a><a href="#platform">Platform</a><a href="#campaign-previews">Campaign previews</a><a href="#results">Results</a><a href="#faq">FAQ</a></div>
      <div><strong>Product</strong><span>Brand intelligence</span><span>Campaign studio</span><span>Lead CRM</span><span>Attribution</span><Link href="/login">Log in</Link><Link href="/signup">Sign up</Link></div>
    </div>
    <div className="container footer-social-row"><span>FIND RAVUS</span><div aria-label="Social platforms"><span><Linkedin size={16} /> LinkedIn</span><span><Instagram size={16} /> Instagram</span><span><MessageCircleMore size={16} /> WhatsApp</span><span><Facebook size={16} /> Facebook</span><span><Youtube size={16} /> YouTube</span></div></div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Ravus. Product concept.</span><span>Designed for the full journey from click to booking.</span></div>
    <FooterWordmark />
  </footer>;
}

export function LandingPage() {
  const [importUrl, setImportUrl] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const preview = (url: string) => { setImportUrl(url); setImportOpen(true); };
  return <div className="landing-page"><Header /><main><Hero onPreview={preview} /><OutcomeRibbon /><ScanShowcaseSection onScan={preview} /><JourneySection /><SwipeCalendarSection /><CreativeSection /><PhoneShowcaseSection /><CreativeCompareSection /><CampaignSection /><PlacementSection /><ApprovalSection /><ConversionSection /><HumanOutcomeSection /><AutopilotSection /><AnalyticsSection /><IndustryStoriesSection /><AgencySection /><FAQ /><Closing onPreview={preview} /></main><Footer /><FloatingPet suspended={importOpen} />{importOpen && <WebsiteScanDialog url={importUrl} onOpenChange={setImportOpen} />}</div>;
}
