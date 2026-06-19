import { useEffect, useState } from "react";
import { Database, RotateCw, FlaskConical, Thermometer, Shell } from "lucide-react";
import clsx from "clsx";
import { getKnowledgeBase } from "../api/client";
import { sensorMeta, sensorOrder } from "../theme";
import type { KnowledgeBaseResponse, KbThreshold } from "../types";

export default function KnowledgeBaseTab() {
  const [kb, setKb] = useState<KnowledgeBaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>("fruiting");
  const [view, setView] = useState<"table" | "cards">("table");

  const fetchKb = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeBase();
      const data: KnowledgeBaseResponse = await res.json();
      setKb(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchKb(); }, []);

  if (loading) {
    return (
      <div className="glass-strong p-5 min-h-[500px] flex items-center justify-center text-slate-500">
        <RotateCw className="w-5 h-5 animate-spin mr-2" />
        Loading knowledge base...
      </div>
    );
  }

  if (!kb) {
    return (
      <div className="glass-strong p-5 min-h-[500px] flex items-center justify-center text-slate-500">
        <Shell className="w-8 h-8 mb-2" />
        <p>Failed to load knowledge base</p>
      </div>
    );
  }

  return (
    <div className="glass-strong p-5 min-h-[500px]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-100">Knowledge Base</h2>
            <p className="text-xs text-slate-500">
              {kb.crop} · {Object.keys(kb.sensors).length} sensors · {Object.keys(kb.growth_stages).length} growth stages
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex p-0.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
          {(["table", "cards"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx("px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all capitalize", view === v ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400 hover:text-slate-200")}
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={fetchKb} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/60 border border-slate-700/60 transition-all">
          <RotateCw className="w-3 h-3" />
          Reload
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.keys(kb.growth_stages).map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all capitalize border",
              stage === s
                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                : "border-slate-700/40 text-slate-400 hover:text-slate-200"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {view === "cards" ? <SensorCardsView stage={stage} sensors={kb.sensors} thresholds={kb.growth_stages[stage]} /> : <ThresholdTable stage={stage} sensors={kb.sensors} thresholds={kb.growth_stages[stage]} />}

      <div className="mt-6 pt-4 border-t border-slate-800/60">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5" />
          Sensor Reference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {Object.values(kb.sensors).map((s) => (
            <div key={s.name} className="rounded-lg bg-slate-900/40 border border-slate-800/60 p-2.5">
              <p className="text-[10px] font-mono font-semibold text-slate-300">{sensorMeta[s.name]?.short ?? s.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{s.name.replace(/_/g, " ")}</p>
              <p className="text-[9px] text-slate-600 mt-0.5">{s.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThresholdTable({ stage, sensors, thresholds }: { stage: string; sensors: Record<string, { name: string; unit: string }>; thresholds: Record<string, KbThreshold> }) {
  const rows = sensorOrder.map((s) => {
    const t = thresholds[s];
    const meta = sensorMeta[s];
    return { sensor: s, meta, threshold: t, def: sensors[s] };
  });

  const cellClass = "px-2 py-1.5 text-[11px] font-mono tabular-nums";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/60">
            <Th>Sensor</Th>
            <Th>Min</Th>
            <Th>Max</Th>
            <Th>Optimal Min</Th>
            <Th>Optimal Max</Th>
            <Th>Range</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ sensor, meta, threshold, def }) => (
            <tr key={sensor} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
              <td className={cellClass}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: meta?.color }} />
                  <div>
                    <p className="text-slate-200 font-semibold">{meta?.label ?? sensor}</p>
                    <p className="text-[9px] text-slate-600">{def?.unit}</p>
                  </div>
                </div>
              </td>
              <Td>{threshold?.min}</Td>
              <Td>{threshold?.max}</Td>
              <td className={cellClass}>
                <span className={clsx(threshold?.optimal_min != null ? "text-emerald-300" : "text-slate-600")}>{threshold?.optimal_min ?? "—"}</span>
              </td>
              <td className={cellClass}>
                <span className={clsx(threshold?.optimal_max != null ? "text-emerald-300" : "text-slate-600")}>{threshold?.optimal_max ?? "—"}</span>
              </td>
              <td className={cellClass}>
                {threshold?.optimal_min != null && threshold?.optimal_max != null && (
                  <div className="relative h-2 w-24 rounded-full bg-slate-800 overflow-hidden">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/40" style={{ left: `${(threshold.optimal_min / (threshold.max ?? 100)) * 100}%`, right: `${100 - (threshold.optimal_max / (threshold.max ?? 100)) * 100}%` }} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SensorCardsView({ stage, sensors, thresholds }: { stage: string; sensors: Record<string, { name: string; unit: string }>; thresholds: Record<string, KbThreshold> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
      {sensorOrder.map((s) => {
        const t = thresholds[s];
        const meta = sensorMeta[s];
        const def = sensors[s];
        if (!t || !meta) return null;

        return (
          <div key={s} className="slide-in rounded-lg border border-slate-800/60 bg-slate-900/40 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                <span className="text-[11px] font-semibold text-slate-200">{meta.label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{def?.unit}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="rounded bg-slate-950/50 border border-slate-800/40 p-1.5">
                <p className="text-[9px] text-slate-500 uppercase">Min</p>
                <p className={clsx("tabular-nums", t.min != null ? "text-slate-200" : "text-slate-600")}>{t.min ?? "—"}</p>
              </div>
              <div className="rounded bg-slate-950/50 border border-slate-800/40 p-1.5">
                <p className="text-[9px] text-slate-500 uppercase">Max</p>
                <p className={clsx("tabular-nums", t.max != null ? "text-slate-200" : "text-slate-600")}>{t.max ?? "—"}</p>
              </div>
              <div className="rounded bg-slate-950/50 border border-slate-800/40 p-1.5">
                <p className="text-[9px] text-slate-500 uppercase">Optimal</p>
                <p className={clsx("tabular-nums text-emerald-300", t.optimal_min != null ? "text-emerald-300" : "text-slate-600")}>{t.optimal_min ?? "—"}–{t.optimal_max ?? "—"}</p>
              </div>
              <div className="rounded bg-slate-950/50 border border-slate-800/40 p-1.5">
                <p className="text-[9px] text-slate-500 uppercase">Deviation</p>
                <p className="tabular-nums text-slate-400">
                  {t.optimal_min != null && t.optimal_max != null ? `${(t.optimal_max - t.optimal_min).toFixed(1)}` : "—"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  const cls = "px-2 py-1.5 text-[11px] font-mono tabular-nums";
  return <td className={clsx(cls, children != null ? "text-slate-200" : "text-slate-600")}>{children ?? "—"}</td>;
}
