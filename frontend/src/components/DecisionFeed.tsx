import { useState } from "react";
import {
  Droplets,
  Leaf,
  AlertTriangle,
  Bug,
  TrendingUp,
  Eye,
  ChevronDown,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import type { DecisionOutput } from "../types";
import { decisionTypeConfig, decisionTypeOrder, priorityConfig } from "../theme";

const iconMap = {
  droplet: Droplets,
  leaf: Leaf,
  "alert-triangle": AlertTriangle,
  bug: Bug,
  "trending-up": TrendingUp,
  eye: Eye,
} as const;

interface Props {
  decisions: DecisionOutput[];
  historyCount: number;
}

export default function DecisionFeed({ decisions, historyCount }: Props) {
  const [filter, setFilter] = useState<"all" | "active">("active");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const visible = filter === "active" ? decisions.filter((d) => d.priority <= 3) : decisions;

  const grouped: Record<string, DecisionOutput[]> = {};
  for (const d of visible) {
    if (!grouped[d.type]) grouped[d.type] = [];
    grouped[d.type].push(d);
  }

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const totalActive = decisions.filter((d) => d.priority <= 3).length;
  const urgent = decisions.filter((d) => d.priority === 1).length;

  return (
    <div className="glass-strong flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Decision Feed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalActive} active · {decisions.length - totalActive} info · {historyCount} steps
            </p>
          </div>
          {urgent > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
              <span className="text-[10px] font-mono font-bold text-red-300">
                {urgent} URGENT
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-1 p-0.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <button
            onClick={() => setFilter("active")}
            className={clsx(
              "flex-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all",
              filter === "active"
                ? "bg-cyan-500/15 text-cyan-300"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Active ({totalActive})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={clsx(
              "flex-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all",
              filter === "all"
                ? "bg-cyan-500/15 text-cyan-300"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            All ({decisions.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-slate-200">All parameters optimal</p>
            <p className="text-xs text-slate-500 mt-1">No actions required at this step</p>
          </div>
        ) : (
          decisionTypeOrder.map((type) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;
            const config = decisionTypeConfig[type as keyof typeof decisionTypeConfig];
            const Icon = iconMap[config.icon as keyof typeof iconMap];

            return items.map((d, idx) => {
              const key = `${type}-${idx}`;
              const isOpen = expanded.has(historyCount * 100 + idx);
              const pConfig = priorityConfig[d.priority] ?? priorityConfig[4];

              return (
                <div
                  key={key}
                  className="slide-in rounded-lg border border-slate-800/60 bg-slate-900/40 overflow-hidden hover:border-slate-700/80 transition-colors"
                  style={{ background: config.bg }}
                >
                  <button
                    onClick={() => toggle(historyCount * 100 + idx)}
                    className="w-full p-3 text-left flex items-start gap-3"
                  >
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center mt-0.5"
                      style={{ background: `${config.color}25`, border: `1px solid ${config.color}40` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {config.label}
                        </span>
                        <span
                          className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ background: pConfig.bg, color: pConfig.color }}
                        >
                          {pConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
                        {d.action}
                      </p>
                    </div>
                    <ChevronDown
                      className={clsx(
                        "w-3.5 h-3.5 text-slate-500 mt-1 flex-shrink-0 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 border-t border-slate-800/60 pt-2 space-y-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Reasoning
                        </p>
                        <ul className="space-y-0.5">
                          {d.conditions_met.map((c, i) => (
                            <li
                              key={i}
                              className="text-[11px] font-mono text-slate-300 flex items-start gap-1.5"
                            >
                              <span className="text-cyan-400 mt-0.5">·</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Sensor snapshot
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {Object.entries(d.sensor_readings).map(([k, v]) => (
                            <div
                              key={k}
                              className="flex items-center justify-between text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/50 border border-slate-800/40"
                            >
                              <span className="text-slate-500 truncate">{k.slice(0, 6)}</span>
                              <span className="text-slate-200 tabular-nums">{v.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })
        )}
      </div>
    </div>
  );
}
