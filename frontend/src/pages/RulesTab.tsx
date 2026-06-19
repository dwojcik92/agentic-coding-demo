import { useEffect, useState } from "react";
import { BookOpen, Search, RotateCw, ChevronDown, Braces, type LucideIcon } from "lucide-react";
import {
  Droplets,
  Leaf,
  AlertTriangle,
  Bug,
  TrendingUp,
  Eye,
} from "lucide-react";
import clsx from "clsx";
import { getRules } from "../api/client";
import { decisionTypeConfig, decisionTypeOrder, priorityConfig, sensorMeta } from "../theme";
import type { RuleDef } from "../types";

const iconMap: Record<string, LucideIcon> = {
  droplet: Droplets,
  leaf: Leaf,
  "alert-triangle": AlertTriangle,
  bug: Bug,
  "trending-up": TrendingUp,
  eye: Eye,
};

const opMap: Record<string, string> = {
  lt: "<", le: "<=", eq: "=", ge: ">=", gt: ">", ne: "!=",
};

export default function RulesTab() {
  const [rules, setRules] = useState<RuleDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"type" | "priority" | "none">("type");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await getRules();
      const data = await res.json();
      setRules(data.rules);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const filtered = rules.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.name, r.description, r.action, r.decision_type].some((s) => s.toLowerCase().includes(q));
  });

  const toggle = (name: string) => {
    setExpanded((p) => { const n = new Set(p); if (n.has(name)) n.delete(name); else n.add(name); return n; });
  };

  const grouped: Record<string, RuleDef[]> = {};
  if (groupBy === "type") {
    for (const type of decisionTypeOrder) {
      const items = filtered.filter((r) => r.decision_type === type);
      if (items.length > 0) grouped[type] = items;
    }
  } else if (groupBy === "priority") {
    for (const p of [1, 2, 3, 4]) {
      const items = filtered.filter((r) => r.priority === p);
      if (items.length > 0) grouped[`p${p}`] = items;
    }
  } else {
    grouped["all"] = filtered;
  }

  return (
    <div className="glass-strong p-5 min-h-[500px]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-100">Rule Book</h2>
            <p className="text-xs text-slate-500">{rules.length} rules loaded</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 lg:w-56 pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex p-0.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
          {(["type", "priority", "none"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={clsx(
                "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all capitalize",
                groupBy === g
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <button
          onClick={fetchRules}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/60 border border-slate-700/60 transition-all"
        >
          <RotateCw className={clsx("w-3 h-3", loading && "animate-spin")} />
          Reload
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RotateCw className="w-5 h-5 animate-spin mr-2" />
          Loading rules...
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Braces className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">No rules match your search</p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
          {Object.entries(grouped).map(([key, items]) => (
            <div key={key}>
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                {key.startsWith("p") ? (
                  <span className="flex items-center gap-1.5">
                    <span className="opacity-60">{priorityConfig[Number(key[1])]?.label ?? key}</span>
                    <span className="text-slate-700 font-normal">({items.length})</span>
                  </span>
                ) : (
                  <>
                    <span style={{ color: decisionTypeConfig[key as keyof typeof decisionTypeConfig]?.color }}>
                      {decisionTypeConfig[key as keyof typeof decisionTypeConfig]?.label ?? key}
                    </span>
                    <span className="text-slate-700 font-normal">({items.length} rules)</span>
                  </>
                )}
              </h3>
              <div className="space-y-1.5">
                {items.map((rule) => {
                  const isOpen = expanded.has(rule.name);
                  const cfg = decisionTypeConfig[rule.decision_type as keyof typeof decisionTypeConfig];
                  const Icon = iconMap[cfg?.icon as keyof typeof iconMap] ?? BookOpen;
                  const pCfg = priorityConfig[rule.priority] ?? priorityConfig[4];

                  return (
                    <div key={rule.name} className="slide-in rounded-lg border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-colors">
                      <button onClick={() => toggle(rule.name)} className="w-full p-3 text-left flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center mt-0.5" style={{ background: `${cfg?.color}20`, border: `1px solid ${cfg?.color}35` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: cfg?.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-mono font-semibold text-slate-200">{rule.name}</span>
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: pCfg.bg, color: pCfg.color }}>{pCfg.label}</span>
                          </div>
                          <p className="text-xs text-slate-400">{rule.description}</p>
                        </div>
                        <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-500 mt-1 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 border-t border-slate-800/60 pt-2 space-y-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Conditions ({rule.condition.operator})</p>
                            <ul className="space-y-0.5">
                              {rule.condition.conditions.map((c, i) => (
                                <li key={i} className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                                  <span className="text-cyan-400">·</span>
                                  <span className="text-slate-400">{sensorMeta[c.sensor]?.short ?? c.sensor}</span>
                                  <span>{opMap[c.operator] ?? c.operator}</span>
                                  <span className="text-amber-300">{c.value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Action</p>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{rule.action}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
