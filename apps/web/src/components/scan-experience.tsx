"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowRight, Check, CircleCheck, Globe2, Layers3, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { CSSProperties, KeyboardEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import styles from "./scan-experience.module.css";

type ScanProfile = {
  url: string;
  domain: string;
  name: string;
  title: string;
  headline: string;
  description: string;
  accent: string;
  topics: string[];
};

const demoProfile: ScanProfile = {
  url: "https://brightviewdental.in",
  domain: "brightviewdental.in",
  name: "Brightview Dental",
  title: "Brightview Dental — Care that feels close to home",
  headline: "A brighter smile starts here",
  description: "Comfortable, modern dental care for the whole family. Book a visit with our local team.",
  accent: "#77B8B8",
  topics: ["Family dentistry", "Teeth whitening", "Same-week appointments"],
};

const steps = [
  { label: "Scan website", detail: "Read the public page", icon: Globe2 },
  { label: "Build brand", detail: "Shape the profile", icon: Layers3 },
  { label: "Generate drafts", detail: "Create a first set", icon: Sparkles },
  { label: "Review", detail: "Your call before launch", icon: ShieldCheck },
];

function PetArtwork({ message }: { message?: string }) {
  return <>
    {message && <span className={styles.petBubble}>{message}</span>}
    <span className={styles.pet} aria-hidden="true">
      <span className={styles.petEarLeft} /><span className={styles.petEarRight} />
      <span className={styles.petFace}><i className={styles.petEyeLeft} /><i className={styles.petEyeRight} /><i className={styles.petNose} /></span>
      <span className={styles.petTail} /><span className={styles.petPawLeft} /><span className={styles.petPawRight} />
    </span>
  </>;
}

function MiniPet({ message }: { message: string }) {
  const petRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startOffset: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const pet = petRef.current;
    const track = pet?.parentElement;
    if (!pet || !track) return;
    const measure = () => {
      const limit = Math.max(0, track.clientWidth - pet.offsetWidth - 24);
      setMaxOffset(limit);
      setOffset((current) => Math.min(current, limit));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(pet);
    measure();
    return () => observer.disconnect();
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startOffset: offset };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset(Math.max(0, Math.min(maxOffset, drag.startOffset + drag.startX - event.clientX)));
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") setOffset((current) => Math.min(maxOffset, current + 24));
    else if (event.key === "ArrowRight") setOffset((current) => Math.max(0, current - 24));
    else if (event.key === "Home") setOffset(maxOffset);
    else if (event.key === "End") setOffset(0);
    else return;
    event.preventDefault();
  };

  return (
    <div ref={petRef} className={styles.petWrap} style={{ right: 12 + offset }} data-dragging={dragging || undefined} role="slider" tabIndex={0} aria-label={`Move Pip left or right. Pip says: ${message}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={maxOffset ? Math.round((1 - offset / maxOffset) * 100) : 100} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={onKeyDown} title="Drag Pip left or right">
      <PetArtwork message={message} />
    </div>
  );
}

type PetPosition = { x: number; y: number };

function clampFloatingPet(position: PetPosition, element: HTMLElement): PetPosition {
  const margin = window.innerWidth <= 520 ? 12 : 18;
  const maxX = Math.max(margin, window.innerWidth - element.offsetWidth - margin);
  const maxY = Math.max(margin, window.innerHeight - element.offsetHeight - margin);
  const minY = Math.min(78, maxY);
  return {
    x: Math.max(margin, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

export function FloatingPet({ suspended = false }: { suspended?: boolean }) {
  const router = useRouter();
  const petRef = useRef<HTMLButtonElement>(null);
  const positionRef = useRef<PetPosition | null>(null);
  const homeRef = useRef<PetPosition | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; startPosition: PetPosition } | null>(null);
  const suppressClickRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [following, setFollowing] = useState(false);
  const [position, setPosition] = useState<PetPosition | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const place = useCallback((target: PetPosition) => {
    const pet = petRef.current;
    if (!pet) return;
    const next = clampFloatingPet(target, pet);
    positionRef.current = next;
    setPosition(next);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPortalTarget(document.body));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!portalTarget) return;
    const pet = petRef.current;
    if (!pet) return;
    const measure = () => {
      const current = positionRef.current;
      const initial = { x: window.innerWidth - pet.offsetWidth - 18, y: window.innerHeight - pet.offsetHeight - (window.innerWidth < 600 ? 18 : 48) };
      place(current ?? initial);
      homeRef.current = clampFloatingPet(homeRef.current ?? initial, pet);
    };
    const checkScroll = () => setVisible(window.scrollY > Math.min(260, window.innerHeight * .36));
    const observer = new ResizeObserver(measure);
    observer.observe(pet);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", checkScroll, { passive: true });
    measure();
    checkScroll();
    let readyFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      checkScroll();
      readyFrame = window.requestAnimationFrame(() => setReady(true));
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(readyFrame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", checkScroll);
    };
  }, [portalTarget, place]);

  useEffect(() => {
    if (!portalTarget || !visible || suspended || reduceMotion) return;
    const timer = window.setInterval(() => {
      const home = homeRef.current;
      if (!home || dragging || performance.now() < pauseUntilRef.current) return;
      const rangeX = window.innerWidth < 600 ? 24 : 110;
      const rangeY = window.innerWidth < 600 ? 18 : 68;
      place({ x: home.x + (Math.random() * 2 - 1) * rangeX, y: home.y + (Math.random() * 2 - 1) * rangeY });
    }, 3300);
    return () => window.clearInterval(timer);
  }, [portalTarget, visible, suspended, reduceMotion, dragging, place]);

  useEffect(() => {
    if (visible && !suspended) return;
    const frame = window.requestAnimationFrame(() => setFollowing(false));
    return () => window.cancelAnimationFrame(frame);
  }, [visible, suspended]);

  useEffect(() => {
    if (!portalTarget || !visible || suspended || reduceMotion) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let lastMove = 0;
    let idleTimer = 0;
    const followPointer = (event: globalThis.PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse" || dragRef.current) return;
      const now = performance.now();
      if (now - lastMove < 48) return;
      lastMove = now;
      const pet = petRef.current;
      const home = homeRef.current;
      if (!pet || !home) return;
      const directionX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
      const directionY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
      pet.style.setProperty("--pet-look-x", `${(directionX * 2.5).toFixed(1)}px`);
      pet.style.setProperty("--pet-look-y", `${(directionY * 1.5).toFixed(1)}px`);
      pet.style.setProperty("--pet-face-tilt", `${(directionX * 5).toFixed(1)}deg`);
      if (!pet.contains(event.target as Node)) {
        const rangeX = Math.min(320, window.innerWidth * .28);
        const rangeY = Math.min(180, window.innerHeight * .22);
        place({ x: home.x + directionX * rangeX, y: home.y + directionY * rangeY });
      }
      pauseUntilRef.current = now + 1600;
      setFollowing(true);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setFollowing(false), 1400);
    };
    window.addEventListener("pointermove", followPointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", followPointer);
      window.clearTimeout(idleTimer);
    };
  }, [portalTarget, visible, suspended, reduceMotion, place]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !positionRef.current) return;
    suppressClickRef.current = false;
    const bounds = event.currentTarget.getBoundingClientRect();
    const current = clampFloatingPet({ x: bounds.left, y: bounds.top }, event.currentTarget);
    place(current);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startPosition: current };
    pauseUntilRef.current = performance.now() + 7000;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    setFollowing(false);
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6) suppressClickRef.current = true;
    place({ x: drag.startPosition.x + event.clientX - drag.startX, y: drag.startPosition.y + event.clientY - drag.startY });
  };
  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    homeRef.current = positionRef.current;
    pauseUntilRef.current = performance.now() + 7000;
    setDragging(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = positionRef.current;
    if (!current) return;
    const delta = 24;
    let target: PetPosition;
    if (event.key === "ArrowLeft") target = { ...current, x: current.x - delta };
    else if (event.key === "ArrowRight") target = { ...current, x: current.x + delta };
    else if (event.key === "ArrowUp") target = { ...current, y: current.y - delta };
    else if (event.key === "ArrowDown") target = { ...current, y: current.y + delta };
    else return;
    event.preventDefault();
    place(target);
    homeRef.current = clampFloatingPet(target, event.currentTarget);
    pauseUntilRef.current = performance.now() + 7000;
    setFollowing(false);
  };

  const onClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    router.push("/login");
  };

  if (!portalTarget) return null;
  return createPortal(
    <button ref={petRef} type="button" className={`${styles.petWrap} ${styles.floatingPet}`} style={{ left: position?.x ?? 0, top: position?.y ?? 0 }} data-ready={ready} data-visible={ready && visible && !suspended && position !== null} data-dragging={dragging || undefined} data-following={following || undefined} aria-label="Open login with Pip. Drag to move Pip, or use the arrow keys." title="Click Pip to log in, or drag to move" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={onKeyDown} onClick={onClick}>
      <PetArtwork />
    </button>,
    portalTarget,
  );
}

function BrowserTop({ domain }: { domain: string }) {
  return <div className={styles.browserTop}><span className={styles.browserDots}><i /><i /><i /></span><span className={styles.address}><Globe2 size={13} /> {domain}</span><span className={styles.browserMenu}>•••</span></div>;
}

function StageVisual({ step, profile, illustrative = false, onEdit, onViewDrafts }: { step: number; profile: ScanProfile; illustrative?: boolean; onEdit?: () => void; onViewDrafts?: () => void }) {
  const brandStyle = { "--scan-accent": profile.accent } as CSSProperties;
  const description = profile.description || `Discover what ${profile.name} has to offer.`;
  return (
    <div className={styles.stageVisual} style={brandStyle}>
      {step === 0 && <div className={styles.webCard}>
        <BrowserTop domain={profile.domain} />
        <div className={styles.webHero}><div><small>THE BUSINESS WEBSITE</small><strong>{profile.headline || profile.name}</strong><p>{description}</p><span>Explore services <ArrowRight size={12} /></span></div><div className={styles.webHeroArt}><span /><span /><span /></div></div>
        <div className={styles.webServices}>{(profile.topics.length ? profile.topics : ["Services", "About us", "Book a visit"]).slice(0, 3).map((topic) => <span key={topic}>{topic}</span>)}</div>
        <div className={styles.scanBeam} aria-hidden="true" />
        <div className={styles.scanStatus}><LoaderCircle size={14} /> Reading headlines, services and brand cues</div>
      </div>}
      {step === 1 && <div className={styles.brandCard}>
        <div className={styles.cardKicker}><CircleCheck size={15} /> BRAND PROFILE FOUND</div>
        <div className={styles.brandIdentity}><span className={styles.brandMonogram}>{profile.name[0]}</span><div><small>YOUR BRAND</small><strong>{profile.name}</strong><span>{profile.domain}</span></div></div>
        <div className={styles.brandDetails}><div><small>POSITIONING</small><strong>{profile.headline || profile.name}</strong></div><div><small>WHAT WE FOUND</small><strong>{(profile.topics.length ? profile.topics : ["Services", "Customer experience"]).slice(0, 2).join(" · ")}</strong></div></div>
        <div className={styles.palette}><small>STARTER PALETTE</small><div><i style={{ background: profile.accent }} /><i /><i /><i /></div></div>
        <div className={styles.brandFoot}><Check size={14} /> Editable before any draft is used</div>
      </div>}
      {step === 2 && <div className={styles.generatedCard}>
        <div className={styles.cardKicker}><Sparkles size={15} /> STARTER CREATIVE SET</div>
        <div className={styles.creativeGrid}>
          <div className={`${styles.creativeTile} ${styles.creativePrimary}`}><Image src="/images/showcase-dental.webp" alt="Illustrative campaign visual" fill sizes="220px" /><span className={styles.creativeOverlay}><small>{illustrative ? "SAMPLE IMAGE · AD 01" : "AD CONCEPT 01"}</small><strong>{profile.headline || `Meet ${profile.name}`}</strong></span></div>
          <div className={styles.creativeTile}><Image src="/images/clinic-campaign-team-neutral.webp" alt="Illustrative team image" fill sizes="160px" /><span className={styles.creativeOverlay}><small>{illustrative ? "SAMPLE IMAGE · AD 02" : "AD CONCEPT 02"}</small><strong>Discover {(profile.topics[0] || profile.name).slice(0, 45)}</strong></span></div>
          <div className={styles.creativeTile}><Image src="/images/studio-booking-neutral.webp" alt="Illustrative booking image" fill sizes="160px" /><span className={styles.creativeOverlay}><small>{illustrative ? "SAMPLE IMAGE · PAGE" : "LANDING PAGE"}</small><strong>Book with {profile.name}</strong></span></div>
        </div>
        <div className={styles.generatedFoot}><span><Check size={14} /> 2 ad ideas</span><span><Check size={14} /> 1 landing page idea</span><span><Check size={14} /> Ready for edits</span></div>
      </div>}
      {step === 3 && <div className={styles.reviewCard}>
        <div className={styles.reviewHeader}><span className={styles.reviewAvatar}>R</span><div><strong>Ravus draft room</strong><small>Ideas for {profile.name}</small></div><span className={styles.reviewStatus}>Ready to review</span></div>
        <div className={styles.reviewMessage}><Sparkles size={18} /><p>We pulled together a first direction from your public website. Check the brand details and draft ideas before anything goes live.</p></div>
        <div className={styles.reviewRows}><div><span>Brand profile</span><strong><Check size={14} /> Ready</strong></div><div><span>Ad concepts</span><strong><Check size={14} /> 2 drafts</strong></div><div><span>Landing page</span><strong><Check size={14} /> 1 draft</strong></div></div>
        <div className={styles.reviewActions}>{onEdit ? <button type="button" onClick={onEdit}>Edit brand</button> : <span>Request changes</span>}{onViewDrafts ? <button type="button" onClick={onViewDrafts}>View drafts <ArrowRight size={14} /></button> : <span>Review drafts <ArrowRight size={14} /></span>}</div>
        <div className={styles.reviewDisclaimer}><ShieldCheck size={14} /> Nothing has been published or sent.</div>
      </div>}
    </div>
  );
}

export function ScanShowcaseSection({ onScan }: { onScan: (url: string) => void }) {
  const [active, setActive] = useState(0);
  const reduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % steps.length), 4600);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);
  return <section className={styles.section} id="website-scan">
    <div className={`container ${styles.sectionInner}`}>
      <div className={styles.intro}><div className="eyebrow"><span className="eyebrow-dot" /> SEE THE FIRST FIVE MINUTES</div><h2>One link becomes a <em className="editorial-accent">starting line.</em></h2><p>Watch Ravus read a website, find its voice, and prepare ideas for your review. This sample loops through the journey; paste your own URL to scan a public page.</p><button type="button" onClick={() => onScan("demo")} className={styles.tryButton}>Try the sample <ArrowRight size={16} /></button></div>
      <div className={styles.storyShell}>
        <div className={styles.storyTop}><span className={styles.storyLive}><i /> THE RAVUS PROCESS</span><span>01 — 04</span></div>
        <div className={styles.storyBody}>
          <div className={styles.storySteps}>{steps.map((item, index) => { const Icon = item.icon; return <button type="button" key={item.label} onClick={() => setActive(index)} className={`${styles.stepButton} ${active === index ? styles.stepActive : ""}`} aria-current={active === index ? "step" : undefined}><span className={styles.stepIndex}>{active > index ? <Check size={14} /> : `0${index + 1}`}</span><span><strong>{item.label}</strong><small>{item.detail}</small></span><Icon size={17} /></button>; })}</div>
          <div className={styles.storyPreview}><div className={styles.previewLabel}><span className={styles.previewPulse} /> {steps[active].label.toUpperCase()} <span>· SAMPLE</span></div><StageVisual step={active} profile={demoProfile} /><div className={styles.stageProgress} key={active}><span /></div></div>
        </div>
      </div>
    </div>
  </section>;
}

export function WebsiteScanDialog({ url, onOpenChange }: { url: string; onOpenChange: (open: boolean) => void }) {
  const [phase, setPhase] = useState(0);
  const [profile, setProfile] = useState<ScanProfile | null>(null);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [sample, setSample] = useState(url === "demo");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timers: number[] = [];
    async function scan() {
      try {
        let result: ScanProfile;
        if (url === "demo") {
          result = demoProfile;
        } else {
          const response = await fetch("/api/scan-website", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }), signal: controller.signal });
          const body = await response.json();
          if (!response.ok) throw new Error(body.error || "The website could not be scanned.");
          result = body as ScanProfile;
        }
        if (controller.signal.aborted) return;
        setProfile(result);
        timers.push(window.setTimeout(() => setPhase(1), 550));
        timers.push(window.setTimeout(() => setPhase(2), 2200));
        timers.push(window.setTimeout(() => setPhase(3), 4100));
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "The website could not be scanned.");
      }
    }
    scan();
    return () => { controller.abort(); timers.forEach(window.clearTimeout); };
  }, [url]);

  const displayProfile = profile ?? (url === "demo" ? demoProfile : { ...demoProfile, domain: new URL(url).hostname.replace(/^www\./, ""), url });
  return <Dialog.Root open onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className={styles.overlay} /><Dialog.Content className={styles.dialog}>
    <div className={styles.dialogTop}><span className={styles.storyLive}><i /> RAVUS WEBSITE SCAN</span><Dialog.Close className={styles.close} aria-label="Close website scan"><X size={18} /></Dialog.Close></div>
    <Dialog.Title className={styles.dialogTitle}>{error ? "We could not read that page." : phase === 0 ? "Reading your website…" : phase === 1 ? "Your brand, understood." : phase === 2 ? "Making your first drafts." : "Your first ideas are ready."}</Dialog.Title>
    <Dialog.Description className={styles.dialogDescription}>{error ? "Check the address or use the sample to explore the process." : phase === 0 ? `Looking for brand cues on ${displayProfile.domain}.` : sample ? "A sample journey for Brightview Dental. Review and edit the starter profile." : `Built from public website text at ${displayProfile.domain}. Review and edit the starter profile.`}</Dialog.Description>
    <div className={styles.dialogSteps}>{steps.map((item, index) => <span key={item.label} className={phase === index ? styles.dialogStepActive : phase > index ? styles.dialogStepDone : ""}>{phase > index ? <Check size={13} /> : `0${index + 1}`}<span>{item.label}</span></span>)}</div>
    {error ? <div className={styles.errorPanel}><Globe2 size={28} /><p>{error}</p><button type="button" onClick={() => { setError(""); setSample(true); setProfile(demoProfile); setPhase(1); window.setTimeout(() => setPhase(2), 1400); window.setTimeout(() => setPhase(3), 3100); }}>Explore a sample instead <ArrowRight size={15} /></button></div> : <div className={styles.dialogStage}><MiniPet message={phase === 0 ? "Finding your story" : steps[phase].detail} /><StageVisual step={phase} profile={displayProfile} illustrative={!sample} onEdit={phase === 3 ? () => setEditing(true) : undefined} onViewDrafts={phase === 3 ? () => setPhase(2) : undefined} /></div>}
    {editing && phase === 3 && profile && <div className={styles.editPanel}><div><strong>Edit the starter profile</strong><button type="button" onClick={() => setEditing(false)} aria-label="Close brand editor"><X size={15} /></button></div><label>Business name<input value={profile.name} maxLength={90} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label><label>Main message<input value={profile.headline} maxLength={150} onChange={(event) => setProfile({ ...profile, headline: event.target.value })} /></label><label>Description<textarea value={profile.description} maxLength={320} rows={3} onChange={(event) => setProfile({ ...profile, description: event.target.value })} /></label><small>Changes stay in this browser preview and update the draft cards.</small></div>}
    <div className={styles.dialogBottom}><span>{error ? "No changes were made" : sample ? "Sample brand · Starter copy" : profile ? "Live website metadata · Starter copy" : "Scanning public page metadata"}</span>{phase === 2 && !error && <button type="button" className={styles.reviewButton} onClick={() => setPhase(3)}>Continue to review <ArrowRight size={15} /></button>}{phase === 3 && !error && <button type="button" className={styles.reviewButton} onClick={() => setReviewed(true)}>{reviewed ? <><Check size={15} /> Marked reviewed in this preview</> : <>Mark as reviewed <ArrowRight size={15} /></>}</button>}</div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
