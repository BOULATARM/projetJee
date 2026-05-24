"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Pause, SkipBack, ChevronRight } from "lucide-react";
import type { AttackEvent, SeverityLevel } from "@/types";
import { SEVERITY_COLORS, ATTACK_LABELS } from "@/types";

interface AttackTimelineProps {
  events: AttackEvent[];
}

function EventItem({ event, index, active }: { event: AttackEvent; index: number; active: boolean }) {
  const color = SEVERITY_COLORS[event.severity];
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: active ? 1 : 0.4, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 group"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className="w-3 h-3 rounded-full border-2 shrink-0 mt-1"
          style={{ borderColor: color, backgroundColor: active ? `${color}30` : "transparent" }}
        />
        <div className="w-px flex-1 bg-cyber-border mt-1" />
      </div>

      <div className={`flex-1 pb-4 group-last:pb-0`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${color}15`, color }}
              >
                {event.severity.toUpperCase()}
              </span>
              {event.mitre_technique && (
                <span className="text-xs font-mono text-cyber-text-dim bg-white/5 px-1.5 py-0.5 rounded">
                  {event.mitre_technique}
                </span>
              )}
            </div>
            <p className="text-xs text-cyber-text leading-relaxed">{event.description}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-cyber-text-dim font-mono">
              <span>{time}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-cyber-cyan">{event.source_node}</span>
              <span>→</span>
              <span style={{ color: event.success ? color : "#4a7a9b" }}>{event.target_node}</span>
              {event.success ? (
                <span className="text-cyber-red">COMPROMISED</span>
              ) : (
                <span className="text-cyber-green">BLOCKED</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AttackTimeline({ events }: AttackTimelineProps) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(events.length);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    setCurrentIndex(events.length);
  }, [events.length]);

  useEffect(() => {
    if (!playing || currentIndex >= events.length) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(
      () => setCurrentIndex((i) => i + 1),
      1000 / playbackSpeed
    );
    return () => clearTimeout(timer);
  }, [playing, currentIndex, events.length, playbackSpeed]);

  const handleReset = () => {
    setPlaying(false);
    setCurrentIndex(0);
  };

  const visibleEvents = events.slice(0, currentIndex);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-semibold text-cyber-text">Attack Timeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="text-xs bg-white/5 border border-cyber-border rounded px-2 py-1 text-cyber-text-dim focus:outline-none"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
          <button
            onClick={handleReset}
            className="w-7 h-7 rounded flex items-center justify-center text-cyber-text-dim hover:text-cyber-cyan border border-cyber-border hover:border-cyber-cyan/30 transition-all"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (currentIndex >= events.length) {
                setCurrentIndex(0);
              }
              setPlaying((p) => !p);
            }}
            disabled={events.length === 0}
            className="w-7 h-7 rounded flex items-center justify-center bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/20 transition-all disabled:opacity-30"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {events.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-cyber-text-dim mb-1">
            <span>{visibleEvents.length} / {events.length} events</span>
            <span>
              {events.length > 0
                ? `${Math.round((currentIndex / events.length) * 100)}%`
                : "0%"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-cyber-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyber-cyan rounded-full"
              animate={{
                width: events.length > 0 ? `${(currentIndex / events.length) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      )}

      {/* Events */}
      <div className="flex-1 overflow-y-auto pr-1">
        {visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-cyber-text-dim text-sm">
            <Clock className="w-8 h-8 mb-2 opacity-30" />
            <p>No events recorded</p>
            <p className="text-xs mt-1">Launch a simulation to see the attack timeline</p>
          </div>
        ) : (
          <div className="space-y-0">
            {visibleEvents.map((event, i) => (
              <EventItem
                key={event.id}
                event={event}
                index={i}
                active={i >= visibleEvents.length - 3}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
