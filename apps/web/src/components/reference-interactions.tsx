"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Instagram,
  MessageCircleMore,
  MousePointer2,
  Send,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const posts = [
  {
    business: "Brightview Dental",
    category: "DENTAL CARE",
    headline: "Dental care that fits your week.",
    detail: "Same-week consultation slots are open.",
    action: "Book your visit",
    theme: "dental",
    image: "/images/showcase-dental.webp",
    day: 1,
    slot: 1,
    time: "11:30 AM",
  },
  {
    business: "Sunrise Fitness",
    category: "LOCAL FITNESS",
    headline: "Your first session starts here.",
    detail: "Find your first session, built around you.",
    action: "Claim a session",
    theme: "fitness",
    image: "/images/fitness-session-neutral.webp",
    day: 3,
    slot: 0,
    time: "8:00 AM",
  },
  {
    business: "Northside Homes",
    category: "REAL ESTATE",
    headline: "The right home is closer than you think.",
    detail: "Tour new spaces with a local expert.",
    action: "Schedule a tour",
    theme: "homes",
    image: "/images/showcase-property.webp",
    day: 5,
    slot: 3,
    time: "4:00 PM",
  },
  {
    business: "Cedar & Steam",
    category: "LOCAL CAFÉ",
    headline: "Make room for a better morning.",
    detail: "A good table and a warm welcome are waiting.",
    action: "Reserve a table",
    theme: "cafe",
    image: "/images/showcase-cafe.webp",
    day: 6,
    slot: 1,
    time: "10:00 AM",
  },
] as const;

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function SwipeCalendarSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [approved, setApproved] = useState<number[]>([]);
  const [direction, setDirection] = useState(1);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(sectionRef, { amount: 0.18 });

  useEffect(() => {
    if (reduceMotion || !inView) return;
    if (current >= posts.length) {
      const resetTimer = window.setTimeout(() => {
        setApproved([]);
        setCurrent(0);
      }, 1500);
      return () => window.clearTimeout(resetTimer);
    }
    const timer = window.setTimeout(() => {
      setDirection(1);
      setApproved((existing) => existing.includes(current) ? existing : [...existing, current]);
      setCurrent(current + 1);
    }, 3300);
    return () => window.clearTimeout(timer);
  }, [current, inView, reduceMotion]);

  const decide = (accept: boolean) => {
    if (current >= posts.length) return;
    setDirection(accept ? 1 : -1);
    if (accept) setApproved((existing) => existing.includes(current) ? existing : [...existing, current]);
    setCurrent((value) => value + 1);
  };

  const reset = () => {
    setApproved([]);
    setCurrent(0);
  };

  return (
    <section className="swipe-section" id="approve-posts">
      <div className="container">
        <div className="section-intro center swipe-intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> CONTENT APPROVAL</div>
          <h2 className="sr-only">Review a post and see it scheduled</h2>
          <p>See how an approved creative becomes a scheduled post. The sample cycles through four local businesses, and you can still approve or skip a card.</p>
        </div>
        <div className="swipe-layout">
          <motion.div ref={sectionRef} className="swipe-stage" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <div className="swipe-stage-top">
              <div className="swipe-stage-title"><span className="swipe-stage-label"><Instagram size={16} /> POST PREVIEW</span><h3>A quick decision.</h3></div>
              <span className="swipe-stage-actions">{Math.min(current + 1, posts.length)} / {posts.length}</span>
            </div>
            <div className="swipe-deck" aria-live="polite">
              {current < posts.length ? (
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={current}
                    className={`swipe-card swipe-card-${posts[current].theme}`}
                    custom={direction}
                    initial={reduceMotion ? false : { opacity: 0, x: 45, rotate: 6, scale: 0.94 }}
                    animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 330, rotate: direction * 15, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 85) decide(true);
                      if (info.offset.x < -85) decide(false);
                    }}
                    role="group"
                    aria-label={`${posts[current].business} post preview`}
                  >
                    <div className="swipe-card-inner">
                      <div className="swipe-card-image-wrap" aria-hidden="true"><Image className="swipe-card-image" src={posts[current].image} alt="" fill sizes="(max-width: 780px) 100vw, 430px" /></div>
                      <span className="swipe-card-brand"><span className="swipe-card-monogram">{posts[current].business[0]}</span>{posts[current].business}</span>
                      <div className="swipe-card-copy"><small>{posts[current].category}</small><strong>{posts[current].headline}</strong><span>{posts[current].detail}</span><b>{posts[current].action} <ArrowRight size={14} /></b></div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <motion.div className="swipe-complete" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                  <CalendarDays size={38} /><strong>Review complete.</strong><span>{approved.length} sample {approved.length === 1 ? "post" : "posts"} placed on the calendar.</span>
                  {reduceMotion && <button type="button" onClick={reset}>Start again</button>}
                </motion.div>
              )}
            </div>
            <div className="swipe-buttons">
              <button type="button" onClick={() => decide(false)} disabled={current >= posts.length} aria-label="Skip this post"><ArrowLeft size={18} /> Skip</button>
              <button type="button" onClick={() => decide(true)} disabled={current >= posts.length} aria-label="Approve this post">Approve <Check size={18} /></button>
            </div>
            <span className="swipe-hint"><MousePointer2 size={14} /> Drag the card right to approve, left to skip.</span>
          </motion.div>
          <motion.div className="calendar-shell" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="calendar-top"><div><small>PUBLISHING CALENDAR</small><h3>A full calendar.</h3></div><span><CalendarDays size={15} /> {approved.length} scheduled</span></div>
            <div className="calendar-grid">
              {days.map((day, dayIndex) => (
                <div className="calendar-day" key={day}>
                  <div className="calendar-day-head"><small>{day}</small><strong>{21 + dayIndex}</strong></div>
                  <div className="calendar-day-body">
                    {[0, 1, 2, 3].map((slot) => (
                      <div className="calendar-slot" key={slot}>
                        {approved.filter((postIndex) => posts[postIndex].day === dayIndex && posts[postIndex].slot === slot).map((postIndex) => (
                          <motion.div className={`calendar-event calendar-event-${posts[postIndex].theme}`} key={postIndex} initial={{ opacity: 0, y: 18, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 350, damping: 25 }}>
                            <span>{posts[postIndex].time}</span><strong>{posts[postIndex].business}</strong><small>Post approved</small>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="calendar-foot"><ShieldCheck size={15} /> A local interaction sample. No channel is connected.<span className="calendar-scroll-hint">Swipe to see the week →</span></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function CreativeCompareSection() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(100);
  const [edit, setEdit] = useState<"clarity" | "booking">("clarity");
  const [typedCount, setTypedCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "reveal" | "hold">("typing");
  const [hasInteracted, setHasInteracted] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(panelRef, { amount: 0.3 });
  const prompt = edit === "clarity"
    ? "Remove the phone number and simplify the message."
    : "Make the booking action clearer and easier to find.";

  const visibleSplit = reduceMotion && !hasInteracted ? 50 : split;

  useEffect(() => {
    if (!inView || reduceMotion) return;
    if (phase === "typing") {
      const timer = window.setTimeout(() => {
        if (typedCount < prompt.length) setTypedCount((count) => count + 1);
        else {
          setSplit(5);
          setPhase("reveal");
        }
      }, typedCount < prompt.length ? 42 : 380);
      return () => window.clearTimeout(timer);
    }
    if (phase === "reveal") {
      const timer = window.setTimeout(() => setPhase("hold"), 1800);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setEdit((value) => value === "clarity" ? "booking" : "clarity");
      setTypedCount(0);
      setSplit(100);
      setPhase("typing");
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [edit, inView, phase, prompt.length, reduceMotion, typedCount]);

  const chooseEdit = (value: "clarity" | "booking") => {
    setEdit(value);
    setTypedCount(0);
    setSplit(100);
    setHasInteracted(false);
    setPhase("typing");
  };

  const replayPreview = () => {
    if (reduceMotion) return;
    setTypedCount(0);
    setSplit(100);
    setPhase("typing");
  };

  return (
    <section className="compare-section" id="edit-by-talking">
      <div className="container compare-layout">
        <div className="compare-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> EDIT BY TALKING</div>
          <h2>Say what to change.<br /><em className="editorial-accent">See the next version.</em></h2>
          <p>Watch a request turn into a cleaner creative, then drag across the image to inspect the change. The original stays in the version history.</p>
          <div className="edit-prompts" role="group" aria-label="Sample creative edit requests">
            <button className={edit === "clarity" ? "active" : ""} type="button" onClick={() => chooseEdit("clarity")}><WandSparkles size={15} /> Remove clutter and phone number</button>
            <button className={edit === "booking" ? "active" : ""} type="button" onClick={() => chooseEdit("booking")}><WandSparkles size={15} /> Make the booking action clearer</button>
          </div>
          <div className="compare-version-line"><span>ORIGINAL DRAFT</span><ChevronRight size={15} /><span>{edit === "clarity" ? "SIMPLIFIED MESSAGE" : "BOOKING FOCUS"}</span></div>
        </div>
        <motion.div ref={panelRef} className="compare-panel compare-panel-playing" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div className="compare-panel-top"><span><Sparkles size={15} /> BRIGHTVIEW DENTAL / CREATIVE HISTORY</span><span>Two sample directions</span></div>
          <div className="compare-viewport">
            <div className="compare-art compare-before">
              <Image className="compare-art-image" src="/images/showcase-dental.webp" alt="" fill sizes="(max-width: 780px) 100vw, 640px" />
              <span className="compare-art-logo">B / BRIGHTVIEW</span><span className="compare-art-edition">ORIGINAL DRAFT</span>
              <span className="compare-art-headline">DENTAL CARE<br />FOR EVERYONE.</span>
              <span className="compare-art-footer">Great offers · Friendly team · Call today<br />+91 98765 43210</span>
              <span className="compare-art-cta">LEARN MORE</span>
            </div>
            <div className="compare-after-mask" style={{ clipPath: `inset(0 0 0 ${visibleSplit}%)` }}>
              <div className="compare-art compare-after">
                <Image className="compare-art-image" src="/images/showcase-dental.webp" alt="" fill sizes="(max-width: 780px) 100vw, 640px" />
                <span className="compare-art-logo">B / BRIGHTVIEW</span><span className="compare-art-edition">REVISED CREATIVE</span>
                <span className="compare-art-headline">{edit === "clarity" ? <>CARE THAT FITS<br />YOUR WEEK.</> : <>YOUR NEXT VISIT<br />STARTS HERE.</>}</span>
                <span className="compare-art-footer">Same-week consultations in Bengaluru.</span>
                <span className="compare-art-cta">{edit === "clarity" ? "SEE AVAILABLE TIMES" : "BOOK A VISIT"} <ArrowRight size={13} /></span>
              </div>
            </div>
            <div className="compare-divider" style={{ left: `${visibleSplit}%` }} aria-hidden="true"><span><ArrowLeft size={14} /><ArrowRight size={14} /></span></div>
            <input className="compare-range" type="range" min="0" max="100" value={visibleSplit} onChange={(event) => { setHasInteracted(true); setSplit(Number(event.target.value)); setTypedCount(prompt.length); setPhase("hold"); }} aria-label="Drag to compare original and revised creative" />
          </div>
          <div className="compare-panel-bottom"><span>BEFORE</span><span>DRAG TO COMPARE</span><span>AFTER</span></div>
          <div className="compare-command" aria-label={`Sample edit request: ${prompt}`}><span>EDIT REQUEST / SAMPLE</span><div><WandSparkles size={16} /><strong>{!reduceMotion ? prompt.slice(0, typedCount) : prompt}<i className={phase === "typing" && !reduceMotion ? "compare-cursor" : ""} /></strong><button className="compare-command-send" type="button" onClick={replayPreview} aria-label="Replay sample edit"><ArrowRight size={16} /></button></div></div>
        </motion.div>
      </div>
    </section>
  );
}

const proposals = [
  { title: "Recover visitors close to booking", detail: "38 people reached the appointment step this week.", why: "They were close to booking. A tailored reminder could bring them back to the service they viewed.", icon: <MousePointer2 size={17} />, label: "Lead recovery", metric: "38 high-intent visits", image: "/images/canvas-care-patient-neutral.webp", bars: [32, 50, 41, 72, 63, 86, 76] },
  { title: "Move spend toward booked visits", detail: "Search is producing more bookings per rupee.", why: "The search campaign is converting more appointments than the broad social campaign. Review the budget before shifting it.", icon: <CircleDollarSign size={17} />, label: "Budget suggestion", metric: "2.4× booking rate", image: "/images/canvas-care-greeting-neutral.webp", bars: [23, 38, 42, 59, 54, 76, 90] },
  { title: "Reply to 12 opted-in leads", detail: "A short follow-up draft is ready for review.", why: "These people asked about availability but have not chosen a slot. A clear answer may help them decide.", icon: <MessageCircleMore size={17} />, label: "Follow-up draft", metric: "12 warm conversations", image: "/images/studio-booking-neutral.webp", bars: [41, 56, 47, 67, 62, 78, 87] },
];

export function AutopilotSection() {
  const [statuses, setStatuses] = useState<Array<"proposed" | "reviewing">>(["proposed", "proposed", "proposed"]);
  const [selected, setSelected] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const reduceMotion = usePrefersReducedMotion();
  const startReview = (index: number) => setStatuses((existing) => existing.map((status, item) => item === index ? "reviewing" : status));
  const finishReview = (index: number) => {
    setDone((existing) => existing.includes(index) ? existing : [...existing, index]);
    setStatuses((existing) => existing.map((status, item) => item === index ? "proposed" : status));
  };

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(() => {
      const reviewing = statuses.findIndex((status, index) => status === "reviewing" && !done.includes(index));
      if (reviewing >= 0) {
        setDone((existing) => existing.includes(reviewing) ? existing : [...existing, reviewing]);
        setStatuses((existing) => existing.map((status, index) => index === reviewing ? "proposed" : status));
        setSelected(reviewing);
        return;
      }
      const next = statuses.findIndex((status, index) => status === "proposed" && !done.includes(index));
      if (next >= 0) {
        setStatuses((existing) => existing.map((status, index) => index === next ? "reviewing" : status));
        setSelected(next);
        return;
      }
      setDone([]);
      setStatuses(["proposed", "proposed", "proposed"]);
      setSelected(0);
    }, done.length === proposals.length ? 5200 : 3600);
    return () => window.clearTimeout(timer);
  }, [statuses, done, reduceMotion]);

  return (
    <section className="autopilot-section" id="suggestions">
      <div className="container">
        <div className="section-intro center"><div className="eyebrow"><span className="eyebrow-dot" /> NEXT BEST ACTION</div><h2>The next move comes<br /><em>with a reason.</em></h2><p>Ravus watches the signals across your journey, brings forward the next useful move, and shows why it matters. You make the final call.</p></div>
        <motion.div className="autopilot-board" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div className="autopilot-board-top"><span><Sparkles size={18} /> RAVUS SUGGESTIONS</span><span className="autopilot-live"><i /> A LIVE SAMPLE CYCLE</span></div>
          <div className="autopilot-signal-strip"><span><i /> SIGNALS DETECTED <strong>03</strong></span><span>BRAND <strong>Brightview Dental</strong></span><span>WINDOW <strong>Last 7 days</strong></span><span>CONTROL <strong>Approval required</strong></span></div>
          <div className="autopilot-columns">
            <div className="autopilot-column">
              <h3>PROPOSED <span>{proposals.length - done.length - statuses.filter((value) => value === "reviewing").length}</span></h3>
              <AnimatePresence>
                {proposals.map((proposal, index) => !done.includes(index) && statuses[index] === "proposed" && (
                  <motion.button key={proposal.title} type="button" className={`proposal-card ${selected === index ? "selected" : ""}`} onClick={() => setSelected(index)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 120, scale: 0.9 }}>
                    <span className="proposal-card-icon">{proposal.icon}</span><small>{proposal.label}</small><strong>{proposal.title}</strong><span>{proposal.detail}</span><span className="proposal-metric">{proposal.metric}</span><i><ArrowRight size={15} /></i>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            <div className="autopilot-column"><h3>IN PROGRESS <span>{statuses.filter((value) => value === "reviewing").length}</span></h3><AnimatePresence>{proposals.map((proposal, index) => statuses[index] === "reviewing" && !done.includes(index) && <motion.div className="proposal-card review-card" key={proposal.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 120 }}><span className="proposal-card-icon"><Clock3 size={17} /></span><small>REVIEWING THE SIGNAL</small><strong>{proposal.title}</strong><span>Ravus is checking the evidence and preparing a clear next step.</span><span className="proposal-progress"><i /></span><button type="button" onClick={() => finishReview(index)}>Mark reviewed <Check size={14} /></button></motion.div>)}</AnimatePresence></div>
            <div className="autopilot-column"><h3>REVIEWED <span>{done.length}</span></h3><AnimatePresence>{done.map((index) => <motion.div className="proposal-card done-card" key={proposals[index].title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}><span className="proposal-card-icon"><BadgeCheck size={17} /></span><small>READY FOR YOUR DECISION</small><strong>{proposals[index].title}</strong><span>Rationale prepared. No external action was taken.</span></motion.div>)}</AnimatePresence></div>
          </div>
          <div className="autopilot-detail">
            <div className="autopilot-evidence-image"><Image src={proposals[selected].image} alt="Illustrative local business campaign scene" fill sizes="100px" /></div>
            <div className="autopilot-detail-copy"><span className="eyebrow"><span className="eyebrow-dot" /> WHY THIS SUGGESTION</span><strong>{proposals[selected].title}</strong><p>{proposals[selected].why}</p><div className="autopilot-bars" aria-label={`${proposals[selected].metric} signal trend`}>{proposals[selected].bars.map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}</div></div>
            <span className="autopilot-evidence-metric">{proposals[selected].metric}</span>
            <button type="button" onClick={() => startReview(selected)} disabled={done.includes(selected) || statuses[selected] === "reviewing"}>{done.includes(selected) ? "Reviewed" : statuses[selected] === "reviewing" ? "In review" : "Send to review"}<Send size={15} /></button>
          </div>
        </motion.div>
        <span className="autopilot-note"><ShieldCheck size={15} /> Sample data and decisions. Launching, spending, and messaging require backend approval controls.</span>
      </div>
    </section>
  );
}
