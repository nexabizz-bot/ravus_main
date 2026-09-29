"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, CalendarCheck2, Check, Globe2, MousePointer2 } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const samples = [
  {
    business: "Brightview Dental",
    category: "Dental care",
    image: "/images/showcase-dental.webp",
    alt: "Dentist greeting a patient at a neighborhood clinic",
    headline: "A better visit starts here.",
    description: "A calm introduction to care that brings the next patient closer to booking.",
    action: "Book a visit",
    outcome: "Search to consultation",
    channel: "Local search · landing page",
  },
  {
    business: "Cedar & Steam",
    category: "Cafés & hospitality",
    image: "/images/showcase-cafe.webp",
    alt: "Café owner welcoming guests at a breakfast table",
    headline: "Make room for a better morning.",
    description: "A familiar welcome becomes a simple path from discovery to a reserved table.",
    action: "Reserve a table",
    outcome: "Discovery to reservation",
    channel: "Social post · booking page",
  },
  {
    business: "Northside Homes",
    category: "Real estate",
    image: "/images/showcase-property.webp",
    alt: "Agent showing a bright home to two prospective buyers",
    headline: "The right home feels closer.",
    description: "Give interested buyers a clear next step from the first impression to a viewing.",
    action: "Schedule a tour",
    outcome: "Enquiry to viewing",
    channel: "Local campaign · lead form",
  },
] as const;

function SignalCanvas({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let lastFrame = 0;
    let visible = false;
    let width = 0;
    let height = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const spacing = width < 600 ? 32 : 39;
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const wave = Math.sin(x * .012 + y * .008 + time * .00035);
          context.beginPath();
          context.arc(x, y, 1 + Math.max(0, wave) * .35, 0, Math.PI * 2);
          context.fillStyle = `rgba(255,255,255,${.055 + (wave + 1) * .02})`;
          context.fill();
        }
      }
      context.lineWidth = 1;
      for (let line = 0; line < 3; line++) {
        context.beginPath();
        for (let x = 0; x <= width; x += 12) {
          const y = height * (.28 + line * .22) + Math.sin(x * .006 + time * .00035 + line * 1.8) * 24;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = `rgba(255,255,255,${.06 - line * .013})`;
        context.stroke();
      }
    };

    const animate = (time: number) => {
      if (!visible || reduceMotion) return;
      if (time - lastFrame > 42) {
        draw(time);
        lastFrame = time;
      }
      frame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduceMotion) frame = requestAnimationFrame(animate);
      else cancelAnimationFrame(frame);
    }, { threshold: 0.01 });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    observer.observe(canvas);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [reduceMotion]);

  return <canvas className="phone-signal-canvas" ref={ref} aria-hidden="true" />;
}

export function PhoneShowcaseSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", progress => {
    if (mobile || reduceMotion) return;
    const next = Math.min(samples.length - 1, Math.floor(Math.max(0, progress) * samples.length));
    setActive(current => current === next ? current : next);
  });

  const movePhone = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    event.currentTarget.style.setProperty("--phone-tilt-x", `${(-y * 9).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--phone-tilt-y", `${(x * 12).toFixed(2)}deg`);
  };

  const resetPhone = () => {
    phoneRef.current?.style.setProperty("--phone-tilt-x", "0deg");
    phoneRef.current?.style.setProperty("--phone-tilt-y", "0deg");
  };

  const sample = samples[active];
  return (
    <section className="phone-showcase-section" id="campaign-previews">
      <div className="container phone-showcase-intro">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> CAMPAIGNS IN CONTEXT</div>
          <h2>See the idea.<br /><em className="editorial-accent">Feel the outcome.</em></h2>
        </div>
        <p>Every campaign belongs to a real customer moment. Scroll through three illustrative local-business stories, then explore the creative samples below.</p>
      </div>

      <div className="phone-scroll-track" ref={trackRef}>
        <div className="phone-sticky-stage">
          <SignalCanvas reduceMotion={reduceMotion} />
          <div className="container phone-stage-grid">
            <div className="phone-story-copy" aria-live="polite">
              <span className="phone-chapter">SAMPLE STORY <strong>0{active + 1} / 0{samples.length}</strong></span>
              <span className="phone-category">{sample.category}</span>
              <h3>{sample.business}</h3>
              <p>{sample.description}</p>
              <span className="phone-story-outcome"><CalendarCheck2 size={17} /> {sample.outcome}</span>
            </div>

            <div className="showcase-phone-wrap">
              <div className="showcase-phone-motion">
              <button ref={phoneRef} type="button" className="showcase-phone" aria-label={`${sample.business} illustrative mobile campaign preview. Show next sample`} onClick={() => setActive(current => (current + 1) % samples.length)} onPointerMove={movePhone} onPointerLeave={resetPhone} onBlur={resetPhone}>
                <div className="showcase-phone-screen">
                  <div className="showcase-phone-status"><span>9:41</span><span className="showcase-phone-notch" /><span>●●●</span></div>
                  <div className="showcase-phone-top"><span className="showcase-phone-brand">ravus</span><span>CAMPAIGN PREVIEW</span></div>
                  <div className="showcase-phone-photo">
                    <AnimatePresence initial={false} mode="sync">
                      <motion.div key={sample.image} className="showcase-phone-photo-layer" initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .55, ease: [0.22, 1, 0.36, 1] }}>
                        <Image src={sample.image} alt={sample.alt} fill sizes="(max-width: 520px) 260px, 330px" />
                      </motion.div>
                    </AnimatePresence>
                    <span className="showcase-phone-photo-label">ILLUSTRATIVE SAMPLE</span>
                  </div>
                  <div className="showcase-phone-content">
                    <span>{sample.business.toUpperCase()}</span>
                    <strong>{sample.headline}</strong>
                    <small>{sample.channel}</small>
                    <span className="showcase-phone-cta">{sample.action}<ArrowUpRight size={15} /></span>
                  </div>
                  <div className="showcase-phone-bottom"><span><Globe2 size={14} /> Discover</span><span><MousePointer2 size={14} /> Explore</span><span><CalendarCheck2 size={14} /> Book</span></div>
                </div>
              </button>
              <span className="showcase-phone-shadow" aria-hidden="true" />
              </div>
              <span className="showcase-phone-hint"><MousePointer2 size={13} /> Tap or click the phone to explore</span>
            </div>

            <div className="phone-stage-index" aria-label="Sample campaigns">
              <span>THREE BUSINESSES · ONE CONNECTED PATH</span>
              {samples.map((item, index) => (
                <button key={item.business} type="button" className={index === active ? "active" : ""} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)}>
                  <span>0{index + 1}</span><strong>{item.business}</strong><Check size={15} />
                </button>
              ))}
              <small><ArrowDown size={14} /> Scroll to explore each sample</small>
            </div>
          </div>
        </div>
      </div>

      <div className="container phone-sample-gallery">
        <div className="phone-gallery-heading"><span>THE SAMPLE SET</span><p>Local moments, shown in context. All visuals and outcomes are illustrative.</p></div>
        <div className="phone-gallery-grid">
          {samples.map(item => (
            <article className="phone-gallery-card" key={item.business}>
              <div className="phone-gallery-image"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 780px) 78vw, 32vw" /></div>
              <div className="phone-gallery-card-copy"><span>{item.category}</span><h3>{item.business}</h3><p>{item.outcome} <ArrowUpRight size={15} /></p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
