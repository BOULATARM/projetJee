"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { DashboardMetrics } from "@/types";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-lg p-3 border border-cyber-border text-xs">
        <p className="text-cyber-cyan font-mono mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface AttackChartProps {
  timeline: DashboardMetrics["attack_timeline"];
  topAttacks: DashboardMetrics["top_attack_types"];
}

export default function AttackChart({ timeline, topAttacks }: AttackChartProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Timeline */}
      <div className="xl:col-span-2 glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-cyber-text">Attack Timeline</h3>
            <p className="text-xs text-cyber-text-dim">Last 24 hours</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyber-red inline-block" />
              Attacks
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyber-green inline-block" />
              Blocked
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timeline} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3333" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff3333" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.08)" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#4a7a9b", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#0a3050" }}
              interval={3}
            />
            <YAxis
              tick={{ fill: "#4a7a9b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="attacks"
              name="Attacks"
              stroke="#ff3333"
              fill="url(#attackGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="blocked"
              name="Blocked"
              stroke="#00ff88"
              fill="url(#blockedGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top attack types */}
      <div className="glass-panel rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-cyber-text">Top Attack Types</h3>
          <p className="text-xs text-cyber-text-dim">By event count</p>
        </div>
        {topAttacks.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={topAttacks.map((a) => ({
                name: a.type.replace("_", " ").slice(0, 10),
                count: a.count,
              }))}
              margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.08)" />
              <XAxis
                type="number"
                tick={{ fill: "#4a7a9b", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#4a7a9b", fontSize: 9 }}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Events" fill="#00d4ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-cyber-text-dim text-sm">
            No attacks simulated yet
          </div>
        )}
      </div>
    </div>
  );
}
