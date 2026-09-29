"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  Check,
  Coffee,
  Dumbbell,
  Globe2,
  House,
  Instagram,
  MessageCircleMore,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PlacementSection() {
  return (
    <section className="placement-section">
      <div className="container">
        <Reveal className="section-intro center placement-intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> CHANNEL-READY CAMPAIGNS</div>
          <h2>One good idea.<br /><em className="editorial-accent">Every step connected.</em></h2>
          <p>Show the same offer where a customer discovers it, checks the details, and decides to book. Each placement stays reviewable before it goes live.</p>
        </Reveal>
        <div className="placement-layout">
          <Reveal className="placement-post" delay={0.06}>
            <div className="placement-post-head">
              <span className="placement-post-avatar"><Coffee size={17} /></span>
              <span><strong>Cedar &amp; Steam</strong><small>Sample campaign · Social post</small></span>
              <Instagram size={18} aria-hidden="true" />
            </div>
            <div className="placement-post-image">
              <Image src="/images/showcase-cafe.webp" alt="Café owner welcoming guests at a breakfast table" fill sizes="(max-width: 780px) 100vw, 42vw" />
              <span>GOOD MORNINGS START LOCAL</span>
            </div>
            <div className="placement-post-copy">
              <h3>Make room for a better morning.</h3>
              <p>Fresh brunch, a familiar welcome, and a table ready when you are.</p>
              <span>Reserve a table <ArrowUpRight size={16} /></span>
            </div>
          </Reveal>
          <div className="placement-flow">
            <Reveal className="placement-flow-card" delay={0.12}>
              <div className="placement-flow-head"><span className="placement-flow-icon"><Instagram size={18} /></span><div><small>01 / DISCOVER</small><strong>Content meets the right audience</strong></div></div>
              <div className="placement-channel-row"><span>Organic post</span><span>Local community</span><Check size={16} /></div>
              <div className="placement-channel-row"><span>Paid ad draft</span><span>Nearby diners</span><Check size={16} /></div>
            </Reveal>
            <Reveal className="placement-flow-card placement-landing-card" delay={0.18}>
              <div className="placement-flow-head"><span className="placement-flow-icon"><Globe2 size={18} /></span><div><small>02 / EXPLORE</small><strong>A clear place to take action</strong></div></div>
              <div className="placement-landing-preview">
                <div className="placement-landing-photo"><Image src="/images/showcase-cafe.webp" alt="Breakfast at Cedar and Steam café" fill sizes="150px" /></div>
                <div><small>CEDAR &amp; STEAM</small><strong>Your table is waiting.</strong><span>Brunch · Coffee · Good company</span><b>See available times <ArrowRight size={13} /></b></div>
              </div>
            </Reveal>
            <Reveal className="placement-flow-card" delay={0.24}>
              <div className="placement-flow-head"><span className="placement-flow-icon"><MessageCircleMore size={18} /></span><div><small>03 / CONVERT</small><strong>A conversation that leads to a visit</strong></div></div>
              <div className="placement-message">Hi! Is there a table for two this Saturday?</div>
              <div className="placement-booked"><CalendarCheck2 size={16} /> Table booking confirmed <span>Saturday · 11:00 AM</span></div>
            </Reveal>
          </div>
        </div>
        <div className="placement-note"><ShieldCheck size={15} /> Illustrative previews. Publishing and messaging need your approval and live integrations.</div>
      </div>
    </section>
  );
}

const industries = [
  { number: "01", name: "Dental care", path: "/images/showcase-dental.webp", alt: "Dentist greeting a patient at a neighborhood clinic", result: "Search to consultation", icon: Stethoscope },
  { number: "02", name: "Fitness studios", path: "/images/fitness-session-neutral.webp", alt: "Fitness coach supporting a client in a studio", result: "Interest to first session", icon: Dumbbell },
  { number: "03", name: "Cafés & hospitality", path: "/images/showcase-cafe.webp", alt: "Café owner welcoming guests at a breakfast table", result: "Discovery to reservation", icon: Coffee },
  { number: "04", name: "Real estate", path: "/images/showcase-property.webp", alt: "Agent showing a bright home to two prospective buyers", result: "Enquiry to viewing", icon: House },
] as const;

export function IndustryStoriesSection() {
  return (
    <section className="industry-section">
      <div className="container">
        <Reveal className="industry-intro">
          <div><div className="eyebrow"><span className="eyebrow-dot" /> BUILT AROUND LOCAL MOMENTS</div><h2>Different businesses.<br /><em>One clear path forward.</em></h2></div>
          <p>Ravus starts with what makes each business recognizable, then connects the creative work to the next real customer action.</p>
        </Reveal>
        <div className="industry-grid">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <Reveal className="industry-card" delay={index * 0.07} key={industry.name}>
                <Image src={industry.path} alt={industry.alt} fill sizes="(max-width: 520px) 48vw, (max-width: 780px) 45vw, 24vw" />
                <div className="industry-card-shade" />
                <span className="industry-number">{industry.number} / 04</span>
                <div className="industry-card-content"><span className="industry-icon"><Icon size={18} /></span><h3>{industry.name}</h3><p>{industry.result} <ArrowUpRight size={15} /></p></div>
              </Reveal>
            );
          })}
        </div>
        <span className="industry-note">Illustrative business examples and generated imagery.</span>
      </div>
    </section>
  );
}
