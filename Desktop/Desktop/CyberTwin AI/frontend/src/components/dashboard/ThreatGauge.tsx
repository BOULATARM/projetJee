"use client";

import { motion } from "framer-motion";

interface ThreatGaugeProps {
  score: number;
  label?: string;
}

export default function ThreatGauge({ score, label = "Threat Index" }: ThreatGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const rotation = -135 + (clampedScore / 100) * 270;

  const color =
    clampedScore >= 75
      ? "#ff3333"
      : clampedScore >= 50
      ? "#ff8c00"
      : clampedScore >= 25
      ? "#ffcc00"
      : "#00ff88";

  const level =
    clampedScore >= 75
      ? "CRITICAL"
      : clampedScore >= 50
      ? "HIGH"
      : clampedScore >= 25
      ? "MEDIUM"
      : "LOW";

  return (
    <div className="glass-panel rounded-xl p-5 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-cyber-text mb-3">{label}</h3>

      <div className="relative w-40 h-24 overflow-hidden">
        {/* Background arc */}
        <svg viewBox="0 0 160 96" className="absolute inset-0 w-full h-full">
          <path
            d="M 16 88 A 64 64 0 1 1 144 88"
            fill="none"
            stroke="#0a3050"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 16 88 A 64 64 0 1 1 144 88"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(clampedScore / 100) * 201} 201`}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{ width: 2, height: 56, marginLeft: -1 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{ background: `linear-gradient(to top, transparent, ${color})` }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2"
            style={{ borderColor: color, backgroundColor: "#020b18" }}
          />
        </motion.div>

        {/* Score text */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
          <span className="text-2xl font-bold font-mono" style={{ color }}>
            {clampedScore}
          </span>
        </div>
      </div>

      <motion.span
        className="mt-2 text-xs font-bold tracking-widest"
        style={{ color }}
        key={level}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
      >
        {level}
      </motion.span>

      {/* Tick marks */}
      <div className="flex justify-between w-full mt-2 px-2 text-xs text-cyber-text-dim font-mono">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}
