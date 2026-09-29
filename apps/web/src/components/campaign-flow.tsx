"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck2, LayoutTemplate, Megaphone, MessageCircleMore, Search, Sparkles } from "lucide-react";
import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const steps = [
  { id: "strategy", title: "AI campaign brief", subtitle: "Goal, audience and offer", detail: "Start with the consultation goal, target audience and message the business wants to approve.", icon: Sparkles },
  { id: "meta", title: "Meta creative", subtitle: "Visual ad concepts", detail: "Shape on-brand visuals and copy for social placements before anything goes live.", icon: Megaphone },
  { id: "search", title: "Google Search ad", subtitle: "High-intent searches", detail: "Reach people actively looking for a nearby consultation.", icon: Search },
  { id: "page", title: "Landing page + form", subtitle: "Capture the enquiry", detail: "Give interested visitors a focused page and a clear way to request a visit.", icon: LayoutTemplate },
  { id: "followup", title: "WhatsApp follow-up", subtitle: "Opt-in conversation", detail: "Keep the lead and their context together so the team can respond at the right time.", icon: MessageCircleMore },
  { id: "booking", title: "Booked appointment", subtitle: "Confirmed next step", detail: "Connect the conversation to a confirmed consultation and its originating campaign.", icon: CalendarCheck2 },
] as const;

type Layout = "wide" | "compact" | "mobile";

const positions: Record<Exclude<Layout, "mobile">, Record<string, { x: number; y: number }>> = {
  wide: {
    strategy: { x: 0, y: 175 }, meta: { x: 240, y: 40 }, search: { x: 240, y: 305 },
    page: { x: 480, y: 175 }, followup: { x: 720, y: 175 }, booking: { x: 960, y: 175 },
  },
  compact: {
    strategy: { x: 330, y: 0 }, meta: { x: 70, y: 110 }, search: { x: 590, y: 110 },
    page: { x: 330, y: 225 }, followup: { x: 330, y: 340 }, booking: { x: 330, y: 455 },
  },
};

const connections = [
  ["strategy", "meta"], ["strategy", "search"], ["meta", "page"],
  ["search", "page"], ["page", "followup"], ["followup", "booking"],
] as const;

export function CampaignFlow() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>("compact");
  const [selectedId, setSelectedId] = useState<string>("strategy");
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      const width = canvas.clientWidth;
      setLayout(width < 820 ? "mobile" : width < 1120 ? "compact" : "wide");
    };
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    measure();
    return () => observer.disconnect();
  }, []);

  const nodes = useMemo<Node[]>(() => steps.map((step, index) => {
    const Icon = step.icon;
    return {
      id: step.id,
      ariaLabel: `${step.title}. ${step.subtitle}. Select for more detail.`,
      position: positions[layout === "wide" ? "wide" : "compact"][step.id],
      sourcePosition: layout === "wide" ? Position.Right : Position.Bottom,
      targetPosition: layout === "wide" ? Position.Left : Position.Top,
      data: {
        label: <div className="campaign-node-content">
          <span className="campaign-node-top"><span className="campaign-node-icon"><Icon size={16} strokeWidth={1.8} /></span><span className="campaign-node-number">{String(index + 1).padStart(2, "0")}</span></span>
          <strong>{step.title}</strong><small>{step.subtitle}</small>
        </div>,
      },
      className: `flow-node flow-node-${step.id}${selectedId === step.id ? " flow-node-active" : ""}`,
      selected: selectedId === step.id,
    };
  }), [layout, selectedId]);

  const edges = useMemo<Edge[]>(() => connections.map(([source, target], index) => {
    const highlighted = source === selectedId || target === selectedId;
    const color = highlighted ? "#f1f1f1" : "#666";
    return {
      id: `e${index}`, source, target, type: "smoothstep", animated: !reduceMotion && highlighted,
      style: { stroke: color, strokeWidth: highlighted ? 2 : 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 13, height: 13 },
    };
  }), [selectedId, reduceMotion]);

  const selectedStep = steps.find((step) => step.id === selectedId) ?? steps[0];
  const selectedNumber = steps.findIndex((step) => step.id === selectedId) + 1;

  return <>
    <div ref={canvasRef} className={`flow-canvas flow-canvas-${layout}`} aria-label="Sample campaign flow from brief to booking">
      {layout === "mobile" ? <ol className="campaign-flow-list">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return <li key={step.id}>
            <span className="campaign-flow-list-icon"><Icon size={19} strokeWidth={1.8} /></span>
            <span><small>{String(index + 1).padStart(2, "0")} / 06{step.id === "meta" ? " · CHANNEL A" : step.id === "search" ? " · CHANNEL B" : ""}</small><strong>{step.title}</strong><span>{step.subtitle}</span></span>
          </li>;
        })}
      </ol> : <>
        <div className="campaign-canvas-caption"><span>FROM BRIEF TO BOOKING</span><span>SELECT A STEP TO EXPLORE</span></div>
        <ReactFlow
          key={layout}
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.12, maxZoom: 1.1 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll={false}
          minZoom={0.5}
          maxZoom={1.25}
          onNodeClick={(_, node) => setSelectedId(node.id)}
        >
          <Background color="#303030" gap={25} size={1} />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </>}
    </div>
    {layout !== "mobile" && <div className="campaign-flow-detail" aria-live="polite">
      <span className="campaign-flow-detail-number">{String(selectedNumber).padStart(2, "0")} <span>/ 06</span></span>
      <span className="campaign-flow-detail-copy"><small>SELECTED STEP</small><strong>{selectedStep.title}</strong><span>{selectedStep.detail}</span></span>
    </div>}
  </>;
}
