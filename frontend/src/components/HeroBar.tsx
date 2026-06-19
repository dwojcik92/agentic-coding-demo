import { Sprout, Activity, Clock, MapPin } from "lucide-react";
import type { ExpertResult } from "../types";

interface Props {
  current: ExpertResult | null;
  stepCount: number;
  running: boolean;
}

export default function HeroBar({ current, stepCount, running }: Props) {
  const stage = current?.growth_stage ?? "fruiting";
  const crop = current?.crop ?? "Tomato";

  const activeUrgent = current?.decisions.filter((d) => d.priority === 1).length ?? 0;
  const activeHigh = current?.decisions.filter((d) => d.priority === 2).length ?? 0;

  const optimal = current
    ? Object.values(current.sensor_evaluations).filter((e) => e.status === "ok").length
    : 0;
  const total = current ? Object.keys(current.sensor_evaluations).length : 7;
  const healthPct = total > 0 ? Math.round((optimal / total) * 100) : 0;

  return (
    <div className="glass-strong overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-cyan-300" />
            </div>
            {running && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 pulse-cyan" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-bold text-slate-50 tracking-tight">
                Expert System
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {crop}
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Stage: <span className="text-slate-200 font-medium">{stage}</span>
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stepCount} steps
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 lg:flex lg:items-stretch lg:gap-3">
          <HealthRing healthPct={healthPct} />
          <StatPill label="Urgent" value={activeUrgent} color={activeUrgent > 0 ? "#ef4444" : "#475569"} />
          <StatPill label="High" value={activeHigh} color={activeHigh > 0 ? "#f59e0b" : "#475569"} />
        </div>
      </div>
    </div>
  );
}

function HealthRing({ healthPct }: { healthPct: number }) {
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (healthPct / 100) * circ;
  const color = healthPct >= 80 ? "#10b981" : healthPct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 50 50" className="w-full h-full -rotate-90">
          <circle cx="25" cy="25" r={radius} fill="none" stroke="#1f2942" strokeWidth="4" />
          <circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-mono font-bold text-slate-100 tabular-nums">
            {healthPct}
          </span>
        </div>
      </div>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Health</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Sensors OK</p>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-start justify-center px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60 min-w-[70px]">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span
        className="text-xl font-bold font-mono tabular-nums leading-none mt-1"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
