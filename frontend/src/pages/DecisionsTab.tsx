import { useEffect, useState } from "react";
import { ScrollText, AlertCircle, Search, RotateCw, ChevronDown, Clock, ShieldAlert } from "lucide-react";
import clsx from "clsx";
import { getDecisionHistory } from "../api/client";
import { decisionTypeConfig, decisionTypeOrder, priorityConfig, sensorMeta } from "../theme";
import type { DecisionRecord } from "../types";

const opMap: Record<string, string> = {
  lt: "<", le: "<=", eq: "=", ge: ">=", gt: ">", ne: "!=",
};

function parseSnapshot(json: string): Record<string, number> {
  try { return JSON.parse(json); } catch { return {}; }
}

export default function DecisionsTab() {
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getDecisionHistory(200);
      const data: DecisionRecord[] = await res.json();
      setRecords(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = records.filter((r) => {
    const txt = `${r.decision_type} ${r.action} ${r.explanation}`;
    if (search && !txt.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "urgent") return r.priority <= 2;
    if (filter !== "all") return r.decision_type === filter;
    return true;
  });

  const toggle = (id: number) => {
    setExpanded((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const typeCounts: Record<string, number> = {};
  for (const r of records) typeCounts[r.decision_type] = (typeCounts[r.decision_type] ?? 0) + 1;
  const urgentCount = records.filter((r) => r.priority <= 2).length;

  return (
    <div className="glass-strong p-5 min-h-[500px]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <ScrollText className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-100">Decision History</h2>
            <p className="text-xs text-slate-500">{records.length} total entries</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search decisions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/60 border border-slate-700/60 transition-all"
        >
          <RotateCw className={clsx("w-3 h-3", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" count={records.length} />
        <FilterChip active={filter === "urgent"} onClick={() => setFilter("urgent")} label="⚠ Urgent" count={urgentCount} severity />
        {decisionTypeOrder.map((type) => {
          const cfg = decisionTypeConfig[type as keyof typeof decisionTypeConfig];
          if (!cfg) return null;
          return (
            <FilterChip
              key={type}
              active={filter === type}
              onClick={() => setFilter(type)}
              label={cfg.label}
              count={typeCounts[type] ?? 0}
              color={cfg.color}
            />
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RotateCw className="w-5 h-5 animate-spin mr-2" />
          Loading decisions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">No matching decisions</p>
          <p className="text-xs mt-1">Try a different filter or run a simulation step</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map((rec) => {
            const cfg = decisionTypeConfig[rec.decision_type as keyof typeof decisionTypeConfig];
            const pCfg = priorityConfig[rec.priority] ?? priorityConfig[4];
            const snap = parseSnapshot(rec.sensor_snapshot);
            const isOpen = expanded.has(rec.id);

            return (
              <div
                key={rec.id}
                className="slide-in rounded-lg border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-colors"
                style={{ background: cfg?.bg ?? "rgba(148,163,184,0.04)" }}
              >
                <button
                  onClick={() => toggle(rec.id)}
                  className="w-full p-3 text-left flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg?.color }}>
                        {cfg?.label ?? rec.decision_type}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: pCfg.bg, color: pCfg.color }}>
                        {pCfg.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rec.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mt-0.5">{rec.action}</p>
                  </div>
                  <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-500 mt-1 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 border-t border-slate-800/60 pt-2 space-y-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Explanation</p>
                      <p className="text-[11px] text-slate-300">{rec.explanation}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Sensor Snapshot</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                        {Object.entries(snap).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/50 border border-slate-800/40">
                            <span className="text-slate-500">{sensorMeta[k]?.short ?? k}</span>
                            <span className="text-slate-200 tabular-nums">{typeof v === "number" ? v.toFixed(1) : v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-600">
                      Stage: {rec.growth_stage} · ID: {rec.id} · {new Date(rec.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, count, color, severity }: { active: boolean; onClick: () => void; label: string; count: number; color?: string; severity?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border",
        active
          ? severity
            ? "bg-red-500/15 border-red-500/30 text-red-300"
            : color
              ? "border-slate-600/60 text-slate-200"
              : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
          : "border-slate-700/40 text-slate-400 hover:text-slate-200"
      )}
      style={active && color ? { background: `${color}18`, borderColor: `${color}40`, color } : {}}
    >
      <span>{label}</span>
      <span className={clsx("text-[10px] font-mono", active ? "opacity-70" : "text-slate-600")}>{count}</span>
    </button>
  );
}
