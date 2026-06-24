"use client";

import * as React from "react";

interface ScoreGaugeProps {
  value: number;
  size?: number;
  label?: string;
}

function stops(value: number): [string, string] {
  if (value >= 70) return ["#34d399", "#22d3ee"]; // emerald → cyan
  if (value >= 55) return ["#fbbf24", "#f59e0b"]; // amber
  return ["#fb7185", "#f43f5e"]; // rose
}

export function ScoreGauge({ value, size = 150, label }: ScoreGaugeProps) {
  const id = React.useId().replace(/:/g, "");
  const stroke = size >= 140 ? 13 : 11;
  const r = (size - stroke) / 2 - 1;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  const [from, to] = stops(value);

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="hsl(var(--secondary))" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold tracking-tight" style={{ fontSize: size * 0.27 }}>
          {value}
        </span>
        {label && (
          <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
