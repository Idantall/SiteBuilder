import { useEffect, useLayoutEffect, useRef, useState, forwardRef } from "react";
import { Clock, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { motion } from "framer-motion";

/**
 * HeroCardPinpointV2 — source → three branches + OUTPUT node.
 * Robust against null/undefined refs and unstable geometry.
 *
 * Visual semantics
 * - Healthy branches: dotted GREEN with green arrowheads
 * - Bottleneck (selected branch): dotted RED → after 5s becomes dotted GREEN (solution)
 * - Output node mirrors bottleneck state (red→green) with smooth fade/scale
 * - Cycle: 0–5s bottleneck, 5–10s resolved, then repeats
 *
 * Geometry & UX
 * - Connectors use REAL DOM anchors from elements' bounding rects
 * - **Angular** (orthogonal) connectors with sharp elbows (no curves)
 * - Middle path is drawn center→center (straight horizontal)
 */
export default function HeroCardPinpointV2({ highlight = "middle" }) {
  const isTop = highlight === "top";
  const isMid = highlight === "middle";
  const isBot = highlight === "bottom";

  const containerRef = useRef(null);
  const sourceRef = useRef(null);
  const topRef = useRef(null);
  const midRef = useRef(null);
  const botRef = useRef(null);
  const outRef = useRef(null);

  const [anchors, setAnchors] = useState(null);
  const [resolved, setResolved] = useState(false); // after t=5s bottleneck → solution
  const [stackShift, setStackShift] = useState(0); // vertical shift applied to the center column (safe default 0)

  // Cycle: 0–5s bottleneck (red), 5–10s resolved (green), then repeat
  useEffect(() => {
    setResolved(false);
    const id = setInterval(() => setResolved((p) => !p), 5000);
    return () => clearInterval(id);
  }, [highlight]);

  const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);

  // --- Measurement with strong null-guards to avoid runtime errors ---
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    const measure = () => {
      const container = containerRef.current;
      const src = sourceRef.current;
      const t = topRef.current;
      const m = midRef.current;
      const b = botRef.current;
      const o = outRef.current;
      // Guard: ensure all refs exist before touching DOM
      if (!container || !src || !t || !m || !b || !o) return;

      const c = container.getBoundingClientRect();
      const rSrc = src.getBoundingClientRect();

      const source = {
        x: rSrc.right - c.left, // right-middle of the source card
        y: rSrc.top - c.top + rSrc.height / 2,
      };

      const rawTargets = [t, m, b].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - c.left, y: r.top - c.top + r.height / 2 };
      });

      // Keep the cards in place and force the middle connector to be perfectly horizontal
      const branches = rawTargets.map((pt, i) => (i === 1 ? { x: pt.x, y: source.y } : pt));

      // Mid card right edge (start of Output connector)
      const rMid = m.getBoundingClientRect();
      const midCenterY = rMid.top - c.top + rMid.height / 2;
      const midRight = { x: rMid.right - c.left, y: midCenterY };

      // Output left center
      const rOut = o.getBoundingClientRect();
      const output = {
        x: rOut.left - c.left,
        y: rOut.top - c.top + rOut.height / 2,
      };

      // Calculate the bounds of all three middle boxes for proper group centering
      const topRect = t.getBoundingClientRect();
      const midRect = m.getBoundingClientRect();
      const botRect = b.getBoundingClientRect();

      // Find the topmost and bottommost points of the middle column
      const stackTop = Math.min(
        topRect.top - c.top,
        midRect.top - c.top,
        botRect.top - c.top
      );
      const stackBottom = Math.max(
        topRect.bottom - c.top,
        midRect.bottom - c.top,
        botRect.bottom - c.top
      );

      // Calculate the center of the entire stack
      const stackCenterY = (stackTop + stackBottom) / 2;

      // Calculate how much to shift to center the entire stack in the container
      const containerCenterY = c.height / 2;
      const desiredShift = Math.round((containerCenterY - stackCenterY) * 10) / 10;

      // Only update if the shift difference is significant (prevents jitter)
      if (Math.abs(desiredShift - stackShift) > 0.5) {
        setStackShift(desiredShift);
      }

      // Keep previously computed vertical shift; no forced reset to 0 so we can center smoothly

      // Validate all numbers before committing state (prevents WASM/renderer crashes)
      const nums = [
        source.x,
        source.y,
        midRight.x,
        midRight.y,
        output.x,
        output.y,
        ...branches.flatMap((p) => [p.x, p.y]),
      ];
      if (!nums.every(isFiniteNum)) return;

      setAnchors({
        source,
        branches,
        midRight,
        output,
        containerSize: { w: c.width, h: c.height },
      });
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    [containerRef.current, sourceRef.current, topRef.current, midRef.current, botRef.current, outRef.current]
      .filter(Boolean)
      .forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    raf = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [highlight, resolved, stackShift]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-slate-900/90 grid place-items-center shadow-sm">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-slate-900">Pinpoint the bottleneck</h2>
              <p className="text-xs text-slate-500">Live view of your delivery path</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        {/* Body */}
        <div ref={containerRef} className="relative h-96 md:h-80">
          {/* soft backdrop grid */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.04),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.04),transparent_60%)]" />

          {/* Source node */}
          <div
            ref={sourceRef}
            className="absolute top-24 left-4 md:left-6 w-56 rounded-xl bg-white/90 backdrop-blur border border-slate-200 shadow-md p-3 z-10"
            aria-label="source-box"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium text-slate-700">Incoming Requests</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">New tickets enter the pipeline</p>
          </div>

          {/* Target boxes (center column) */}
          <BranchBox
            ref={topRef}
            hot={isTop}
            yClass="top-10"
            xPos="left-[45%] md:left-[47%]"
            width="w-60"
            title={resolved && isMid ? "AI Validation" : "Data Validation"}
            subtitle={resolved && isMid ? "LLM checks + dedupe" : "Schema checks & dedupe"}
            iconHot={<AlertTriangle className="h-4 w-4 text-rose-600" />}
            iconCold={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            style={{ transform: `translateY(${stackShift}px)` }}
          />

          <BranchBox
            ref={midRef}
            hot={isMid && !resolved}
            yClass="top-28"
            xPos="left-[45%] md:left-[47%]"
            width="w-64"
            title={!resolved ? "Manual Review (Bottleneck)" : "AI Auto‑approval"}
            subtitle={!resolved ? "Human approval, slow" : "Policy engine auto‑approves"}
            iconHot={<AlertTriangle className="h-4 w-4 text-rose-600" />}
            iconCold={<Clock className="h-4 w-4 text-amber-500" />}
            resolved={resolved}
            style={{ transform: `translateY(${stackShift}px)` }}
          />

          <BranchBox
            ref={botRef}
            hot={isBot}
            yClass="top-44"
            xPos="left-[45%] md:left-[47%]"
            width="w-60"
            title={resolved && isMid ? "Trigger Fulfillment" : "Fulfillment"}
            subtitle={resolved && isMid ? "Ships instantly" : "Trigger downstream systems"}
            iconHot={<AlertTriangle className="h-4 w-4 text-rose-600" />}
            iconCold={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            style={{ transform: `translateY(${stackShift}px)` }}
          />

          {/* OUTPUT node (far right) */}
          <BranchBox
            ref={outRef}
            hot={false}
            yClass="top-28"
            xPos="right-10"
            width="w-64"
            title={resolved ? "Output (Improved)" : "Output (Delayed)"}
            subtitle={resolved ? "Lead time ↓, Throughput ↑" : "Lead time ↑, Throughput ↓"}
            iconHot={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            iconCold={<Clock className="h-4 w-4 text-amber-500" />}
            resolved={resolved}
            resolvedAccent
          />

          {/* SVG flow (computed from real positions) */}
          {anchors && (
            <SvgFlowDynamic
              anchors={anchors}
              hotIndex={isTop ? 0 : isMid ? 1 : 2}
              resolved={resolved}
            />
          )}

          {/* Legend */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur rounded-xl border border-slate-200 shadow-sm px-3 py-2">
            <ul className="flex items-center gap-4 text-[11px] text-slate-600">
              <li className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Bottleneck</li>
              <li className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> Queueing</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Healthy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const BranchBox = forwardRef(function BranchBox(
  { hot, yClass, width = "w-60", xPos = "right-6", iconHot, iconCold, title, subtitle, resolved = false, resolvedAccent = false, style = undefined },
  ref
) {
  const base = `absolute ${xPos} ${yClass} ${width} min-h-12 rounded-xl border shadow-md px-3 py-2 flex items-start gap-2 bg-white/90 backdrop-blur z-10`;
  const state = hot
    ? "border-rose-200 ring-8 ring-rose-200/60"
    : resolved && (title?.includes("AI") || resolvedAccent)
      ? "border-emerald-300 ring-8 ring-emerald-300/50 animate-pulse"
      : "border-slate-200";

  return (
    <motion.div
      ref={ref}
      className={`${base} ${state}`}
      aria-label={`target-${yClass}`}
      style={style}
      initial={{ opacity: 0.7, scale: 0.98 }}
      animate={{ opacity: 1, scale: resolved ? 1.02 : 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {hot ? iconHot : iconCold}
      <motion.div
        key={resolved ? "resolved" : "pending"}
        initial={{ opacity: 0.6, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col"
      >
        <p className="text-sm font-medium text-slate-800">{title || (hot ? "Bottleneck" : "Healthy stage")}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </motion.div>
    </motion.div>
  );
});

function SvgFlowDynamic({ anchors, hotIndex, resolved }) {
  const { source, branches, midRight, output, containerSize } = anchors || {};

  const uidRef = useRef(null);
  if (!uidRef.current) uidRef.current = `ag${Math.random().toString(36).slice(2, 9)}`;
  const uid = uidRef.current;

  const safeHotIndex = Number.isFinite(hotIndex) && hotIndex >= 0 && hotIndex <= 2 ? hotIndex : 1;

  if (!source || !branches || branches.length !== 3 || !midRight || !output) return null;
  const allNums = [source.x, source.y, midRight.x, midRight.y, output.x, output.y, ...branches.flatMap((p) => [p.x, p.y])];
  if (!allNums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;

  // Compute viewBox extents (include output)
  const endX = (b) => b.x; // arrow tips land exactly on the card edge
  const maxEndX = Math.max(...branches.map((b) => endX(b)), output.x);
  const yAll = [source.y, ...branches.map((b) => b.y), output.y];
  const viewW = Math.max(containerSize?.w || 720, maxEndX + 80);
  const viewH = Math.max(containerSize?.h || 320, Math.max(...yAll) + 60);

  // Angular (orthogonal) elbow path builder
  const elbow = (sx, sy, ex, ey) => {
    const midX = sx + (ex - sx) * 0.55; // bias elbow to the right for nicer spacing
    if (Math.abs(ey - sy) < 0.5) {
      // perfectly horizontal
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ey} L ${ex} ${ey}`;
  };

  const dash = "4 6"; // dotted in both states
  const green = "#10B981"; // emerald-500
  const red = "#F43F5E"; // rose-500

  // Build branch paths
  const branchPaths = branches.map((b, i) => {
    const isHot = i === safeHotIndex;
    const stroke = isHot ? (resolved ? green : red) : green; // hot branch toggles red→green; others stay green
    const d = elbow(source.x, source.y, b.x, b.y);
    const markerId = stroke === green ? `url(#arrow-green-${uid})` : `url(#arrow-red-${uid})`;
    return (
      <path
        key={`branch-${i}`}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeDasharray={dash}
        markerEnd={markerId}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    );
  });

  // Mid → Output path mirrors bottleneck state
  const outStroke = resolved ? green : red;
  const outMarkerId = resolved ? `url(#arrow-green-${uid})` : `url(#arrow-red-${uid})`;
  // Force perfectly horizontal segment from mid to output (no elbow)
  const outPath = `M ${midRight.x} ${midRight.y} L ${output.x} ${midRight.y}`;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="absolute inset-0 pointer-events-none z-0" aria-hidden>
      <defs>
        <marker id={`arrow-green-${uid}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L6,3 L0,6 Z" fill={green} />
        </marker>
        <marker id={`arrow-red-${uid}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L6,3 L0,6 Z" fill={red} />
        </marker>
      </defs>

      {/* Source → top/middle/bottom */}
      {branchPaths}

      {/* Middle (right edge) → Output */}
      <path
        d={outPath}
        fill="none"
        stroke={outStroke}
        strokeWidth={2.5}
        strokeDasharray={dash}
        markerEnd={outMarkerId}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
