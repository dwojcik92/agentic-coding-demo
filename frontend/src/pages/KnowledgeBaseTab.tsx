import { useEffect, useState } from "react";
import {
  Database, RotateCw, FlaskConical, Plus, Trash2, Pencil, X, Check,
} from "lucide-react";
import clsx from "clsx";
import { getKnowledgeBase, updateThreshold, createStage, deleteStage, createSensor, updateSensor, deleteSensor } from "../api/client";
import { sensorMeta, sensorOrder } from "../theme";
import type { KnowledgeBaseResponse, KbThreshold } from "../types";

export default function KnowledgeBaseTab() {
  const [kb, setKb] = useState<KnowledgeBaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>("fruiting");
  const [view, setView] = useState<"table" | "cards">("table");
  const [editingThreshold, setEditingThreshold] = useState<{ stage: string; sensor: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [showStageInput, setShowStageInput] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [showSensorInput, setShowSensorInput] = useState(false);
  const [newSensorName, setNewSensorName] = useState("");
  const [newSensorUnit, setNewSensorUnit] = useState("");
  const [newSensorDesc, setNewSensorDesc] = useState("");
  const [error, setError] = useState("");
  const [editingSensor, setEditingSensor] = useState<string | null>(null);
  const [editSensorUnit, setEditSensorUnit] = useState("");
  const [editSensorDesc, setEditSensorDesc] = useState("");

  const fetchKb = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getKnowledgeBase();
      const data: KnowledgeBaseResponse = await res.json();
      setKb(data);
      if (data && !data.growth_stages[stage]) {
        setStage(Object.keys(data.growth_stages)[0] || "");
      }
    } catch { setError("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { fetchKb(); }, []);

  const startEditThreshold = (s: string, f: string, v: number | null) => {
    setEditingThreshold({ stage: stage, sensor: s, field: f });
    setEditValue(v != null ? String(v) : "");
  };

  const saveThreshold = async () => {
    if (!editingThreshold) return;
    setSavingThreshold(true);
    setError("");
    const val = editValue === "" ? null : parseFloat(editValue);
    try {
      const res = await updateThreshold(editingThreshold.stage, editingThreshold.sensor, {
        [editingThreshold.field]: val,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEditingThreshold(null);
      await fetchKb();
    } catch (e) { setError(String(e)); }
    setSavingThreshold(false);
  };

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;
    setError("");
    try {
      const res = await createStage(newStageName.trim());
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || `HTTP ${res.status}`); }
      setNewStageName("");
      setShowStageInput(false);
      await fetchKb();
      setStage(newStageName.trim());
    } catch (e) { setError(String(e)); }
  };

  const handleDeleteStage = async (s: string) => {
    if (!window.confirm(`Delete growth stage "${s}"? This removes all thresholds.`)) return;
    try {
      const res = await deleteStage(s);
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || `HTTP ${res.status}`); }
      await fetchKb();
    } catch (e) { setError(String(e)); }
  };

  const handleAddSensor = async () => {
    if (!newSensorName.trim()) return;
    setError("");
    try {
      const res = await createSensor(newSensorName.trim(), newSensorUnit.trim(), newSensorDesc.trim());
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || `HTTP ${res.status}`); }
      setNewSensorName(""); setNewSensorUnit(""); setNewSensorDesc("");
      setShowSensorInput(false);
      await fetchKb();
    } catch (e) { setError(String(e)); }
  };

  const handleDeleteSensor = async (name: string) => {
    if (!window.confirm(`Delete sensor "${name}"? This removes all its thresholds.`)) return;
    try {
      const res = await deleteSensor(name);
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || `HTTP ${res.status}`); }
      await fetchKb();
    } catch (e) { setError(String(e)); }
  };

  const handleUpdateSensor = async (name: string) => {
    setError("");
    try {
      const res = await updateSensor(name, { unit: editSensorUnit, description: editSensorDesc });
      if (!res.ok) { const b = await res.json(); throw new Error(b.detail || `HTTP ${res.status}`); }
      setEditingSensor(null);
      await fetchKb();
    } catch (e) { setError(String(e)); }
  };

  if (loading) {
    return <div className="glass-strong p-5 min-h-[500px] flex items-center justify-center text-slate-500">
      <RotateCw className="w-5 h-5 animate-spin mr-2" />Loading knowledge base...
    </div>;
  }

  if (!kb) {
    return <div className="glass-strong p-5 min-h-[500px] flex items-center justify-center text-slate-500">
      <Database className="w-8 h-8 mb-2" /><p>Failed to load knowledge base</p>
    </div>;
  }

  const sensors = Object.keys(kb.growth_stages[stage] ?? {});
  const stages = Object.keys(kb.growth_stages);

  return (
    <div className="glass-strong p-5 min-h-[500px]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-100">Knowledge Base</h2>
            <p className="text-xs text-slate-500">
              {kb.crop} · {Object.keys(kb.sensors).length} sensors · {stages.length} stages
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <button onClick={fetchKb} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/60 border border-slate-700/60 transition-all">
          <RotateCw className={clsx("w-3 h-3", loading && "animate-spin")} /> Reload
        </button>
      </div>

      {error && (
        <div className="text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
          {error} <button onClick={() => setError("")} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Growth stage tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {stages.map((s) => (
          <div key={s} className="flex">
            <button
              onClick={() => setStage(s)}
              className={clsx("px-3 py-1.5 rounded-l-lg text-[11px] font-semibold transition-all capitalize border", stage === s ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300" : "border-slate-700/40 text-slate-400 hover:text-slate-200")}
            >
              {s}
            </button>
            <button
              onClick={() => handleDeleteStage(s)}
              className="px-1.5 py-1.5 rounded-r-lg text-[10px] border border-l-0 border-slate-700/40 text-slate-600 hover:text-red-300 hover:border-red-500/30 transition-all"
              title={`Delete "${s}"`}
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowStageInput(!showStageInput)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-cyan-400 hover:text-cyan-300 border border-dashed border-slate-700/60 hover:border-cyan-500/40 transition-all"
        >
          <Plus className="w-3 h-3 inline-block mr-0.5" /> Stage
        </button>
      </div>

      {showStageInput && (
        <div className="flex items-center gap-1.5 mb-4 p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
          <input
            type="text" value={newStageName} onChange={(e) => setNewStageName(e.target.value)}
            placeholder="Stage name (e.g. ripening)"
            className="flex-1 px-2 py-1 rounded bg-slate-950/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            onKeyDown={(e) => e.key === "Enter" && handleAddStage()}
          />
          <button onClick={handleAddStage} className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={() => setShowStageInput(false)} className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 transition-all">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {view === "cards" ? <SensorCardsView stage={stage} sensors={kb.sensors} thresholds={kb.growth_stages[stage] ?? {}} onDeleteSensor={handleDeleteSensor} /> : (
        <ThresholdTable
          stage={stage}
          sensors={kb.sensors}
          thresholds={kb.growth_stages[stage] ?? {}}
          editingThreshold={editingThreshold}
          editValue={editValue}
          savingThreshold={savingThreshold}
          onEdit={startEditThreshold}
          onEditValueChange={setEditValue}
          onSave={saveThreshold}
          onCancel={() => setEditingThreshold(null)}
        />
      )}

      {/* Sensor reference + editor */}
      <div className="mt-6 pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5" /> Sensor Definitions
          </h3>
          <button onClick={() => setShowSensorInput(!showSensorInput)} className="flex items-center gap-1 text-[10px] font-medium text-cyan-400 hover:text-cyan-300 transition-all">
            <Plus className="w-3 h-3" /> Add Sensor
          </button>
        </div>

        {showSensorInput && (
          <div className="flex items-center gap-1.5 mb-3 p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
            <input type="text" value={newSensorName} onChange={(e) => setNewSensorName(e.target.value)} placeholder="Name" className="w-28 px-2 py-1 rounded bg-slate-950/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
            <input type="text" value={newSensorUnit} onChange={(e) => setNewSensorUnit(e.target.value)} placeholder="Unit" className="w-16 px-2 py-1 rounded bg-slate-950/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
            <input type="text" value={newSensorDesc} onChange={(e) => setNewSensorDesc(e.target.value)} placeholder="Description" className="flex-1 px-2 py-1 rounded bg-slate-950/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" onKeyDown={(e) => e.key === "Enter" && handleAddSensor()} />
            <button onClick={handleAddSensor} className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"><Check className="w-3 h-3" /></button>
            <button onClick={() => setShowSensorInput(false)} className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 transition-all"><X className="w-3 h-3" /></button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {Object.entries(kb.sensors).map(([name, def]) => (
            <div key={name} className="rounded-lg bg-slate-900/40 border border-slate-800/60 p-2.5 group relative">
              {editingSensor === name ? (
                <div className="space-y-1">
                  <input type="text" value={editSensorUnit} onChange={(e) => setEditSensorUnit(e.target.value)} placeholder="Unit" className="w-full px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950/60 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                  <input type="text" value={editSensorDesc} onChange={(e) => setEditSensorDesc(e.target.value)} placeholder="Desc" className="w-full px-1.5 py-0.5 rounded text-[10px] bg-slate-950/60 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdateSensor(name)} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"><Check className="w-2.5 h-2.5" /></button>
                    <button onClick={() => setEditingSensor(null)} className="px-1.5 py-0.5 rounded text-[9px] text-slate-400 hover:text-slate-200"><X className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-semibold text-slate-300">{sensorMeta[name]?.short ?? name}</p>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button onClick={() => { setEditingSensor(name); setEditSensorUnit(def.unit); setEditSensorDesc(def.description); }} className="text-slate-600 hover:text-cyan-300 transition-colors"><Pencil className="w-2.5 h-2.5" /></button>
                      <button onClick={() => handleDeleteSensor(name)} className="text-slate-600 hover:text-red-300 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{name.replace(/_/g, " ")}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{def.unit}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Editable Threshold Table ──

interface TableProps {
  stage: string;
  sensors: Record<string, { name: string; unit: string }>;
  thresholds: Record<string, KbThreshold>;
  editingThreshold: { stage: string; sensor: string; field: string } | null;
  editValue: string;
  savingThreshold: boolean;
  onEdit: (sensor: string, field: string, value: number | null) => void;
  onEditValueChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ThresholdTable({ stage, sensors, thresholds, editingThreshold, editValue, savingThreshold, onEdit, onEditValueChange, onSave, onCancel }: TableProps) {
  const rows = sensorOrder.map((s) => ({ sensor: s, meta: sensorMeta[s], threshold: thresholds[s], def: sensors[s] }));
  const cell = "px-2 py-1.5 text-[11px] font-mono tabular-nums";

  const EditableCell = ({ sensor, field, value, label }: { sensor: string; field: string; value: number | null; label?: string }) => {
    const isEditing = editingThreshold?.sensor === sensor && editingThreshold?.field === field;
    return (
      <td className={cell}>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number" step="any"
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              className="w-16 px-1 py-0.5 rounded bg-slate-950/60 border border-cyan-500/50 text-[10px] font-mono text-slate-200 focus:outline-none"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
            />
            <button onClick={onSave} disabled={savingThreshold} className="text-emerald-400 hover:text-emerald-300"><Check className="w-2.5 h-2.5" /></button>
            <button onClick={onCancel} className="text-slate-500 hover:text-slate-300"><X className="w-2.5 h-2.5" /></button>
          </div>
        ) : (
          <button onClick={() => onEdit(sensor, field, value)} className="hover:text-cyan-300 transition-colors text-left w-full" title={`Edit ${label ?? field}`}>
            <span className={clsx(value != null ? "text-slate-200" : "text-slate-600")}>{value ?? "—"}</span>
          </button>
        )}
      </td>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/60">
            <th className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Sensor</th>
            <th className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Min</th>
            <th className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Max</th>
            <th className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Optimal Min</th>
            <th className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Optimal Max</th>
            <th className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Range</th>
          </tr>
        </thead>
        <tbody>
          {rows.filter((r) => r.threshold).map(({ sensor, meta, threshold, def }) => (
            <tr key={sensor} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
              <td className={cell}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: meta?.color }} />
                  <div>
                    <p className="text-slate-200 font-semibold text-[11px]">{meta?.label ?? sensor}</p>
                    <p className="text-[9px] text-slate-600">{def?.unit}</p>
                  </div>
                </div>
              </td>
              <EditableCell sensor={sensor} field="min" value={threshold.min} />
              <EditableCell sensor={sensor} field="max" value={threshold.max} />
              <EditableCell sensor={sensor} field="optimal_min" value={threshold.optimal_min} label="optimal min" />
              <EditableCell sensor={sensor} field="optimal_max" value={threshold.optimal_max} label="optimal max" />
              <td className={cell}>
                {threshold.optimal_min != null && threshold.optimal_max != null && (
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

// ── Sensor Cards View (read-only alternative) ──

function SensorCardsView({ stage, sensors, thresholds, onDeleteSensor }: { stage: string; sensors: Record<string, { name: string; unit: string }>; thresholds: Record<string, KbThreshold>; onDeleteSensor: (name: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
      {sensorOrder.filter((s) => thresholds[s]).map((s) => {
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
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-500">{def?.unit}</span>
                <button onClick={() => onDeleteSensor(s)} className="text-slate-600 hover:text-red-300 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
              </div>
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
                <p className="tabular-nums text-emerald-300">{t.optimal_min ?? "—"}–{t.optimal_max ?? "—"}</p>
              </div>
              <div className="rounded bg-slate-950/50 border border-slate-800/40 p-1.5">
                <p className="text-[9px] text-slate-500 uppercase">Spread</p>
                <p className="tabular-nums text-slate-400">{t.optimal_min != null && t.optimal_max != null ? (t.optimal_max - t.optimal_min).toFixed(1) : "—"}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
