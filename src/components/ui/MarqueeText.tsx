"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function MarqueeText({ text, className, speed = 22 }: { text: string; className?: string; speed?: number }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  const [playing, setPlaying] = useState(false);

  function handleEnter() {
    const wrap = wrapRef.current;
    const inner = textRef.current;
    if (!wrap || !inner || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const overflow = Math.ceil(inner.scrollWidth - wrap.clientWidth);
    if (overflow <= 2) {
      setShift(0);
      setPlaying(false);
      return;
    }
    setShift(overflow + 4);
    setPlaying(true);
  }

  function handleLeave() {
    setPlaying(false);
  }

  return (
    <span ref={wrapRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} className={cn("block min-w-0 overflow-hidden", className)}>
      <span
        ref={textRef}
        className="block whitespace-nowrap"
        style={playing && shift > 0 ? ({ "--marquee-shift": `${shift}px`, animation: `led-marquee ${Math.max(2.4, shift / speed)}s ease-in-out infinite alternate` } as React.CSSProperties) : undefined}
      >
        {text}
      </span>
    </span>
  );
}
