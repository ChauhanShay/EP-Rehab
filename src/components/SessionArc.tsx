import { useEffect, useRef, useState } from "react";

const CX = 100;
const CY = 100;
const R = 82;
const START = 150; // degrees, lower-left
const SWEEP = 240; // total arc opening, gap at the bottom

function polar(deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
}

function arcPath(fromDeg: number, toDeg: number): string {
  const [x1, y1] = polar(fromDeg);
  const [x2, y2] = polar(toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Range-of-motion arc: opens from the start as the day's movements are
 * completed, with a leading dot travelling along it. `frac` is 0..1.
 */
export function SessionArc({
  frac,
  done,
  total,
  noun = "movement",
}: {
  frac: number;
  done: number;
  total: number;
  noun?: string;
}) {
  const [anim, setAnim] = useState(prefersReduced() ? frac : 0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (prefersReduced()) {
      setAnim(frac);
      return;
    }
    const start = performance.now();
    const from = anim;
    const dur = 750;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setAnim(from + (frac - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frac]);

  const endDeg = START + SWEEP * anim;
  const [dotX, dotY] = polar(total === 0 ? START : endDeg);

  const complete = total > 0 && done >= total;
  const headline =
    total === 0
      ? "Nothing planned"
      : complete
        ? "All done"
        : done === 0
          ? "Ready when you are"
          : "Keep going";
  const sub =
    total === 0
      ? "Add daily rehab in Plan"
      : `${done} of ${total} ${noun}${total === 1 ? "" : "s"} done`;

  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 200 160" className="w-full" role="img" aria-label={`${done} of ${total} movements done`}>
        <defs>
          <linearGradient id="arcfill" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#557a5f" />
            <stop offset="60%" stopColor="#6e9277" />
            <stop offset="100%" stopColor="#e2a24e" />
          </linearGradient>
        </defs>
        {/* track */}
        <path
          d={arcPath(START, START + SWEEP)}
          fill="none"
          stroke="#dde4d4"
          strokeWidth={13}
          strokeLinecap="round"
        />
        {/* progress */}
        {anim > 0.001 && (
          <path
            d={arcPath(START, endDeg)}
            fill="none"
            stroke="url(#arcfill)"
            strokeWidth={13}
            strokeLinecap="round"
          />
        )}
        {/* leading dot */}
        <circle cx={dotX} cy={dotY} r={9} fill="#ffffff" />
        <circle cx={dotX} cy={dotY} r={5.5} fill={complete ? "#e2a24e" : "#456b4f"} />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center text-center">
        <span className="font-display text-[1.7rem] leading-none text-slate-800">
          {headline}
          {complete && " 🌿"}
        </span>
        <span className="mt-2.5 text-sm text-slate-500">{sub}</span>
      </div>
    </div>
  );
}
