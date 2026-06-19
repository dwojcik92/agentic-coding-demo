import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { decisionTypeConfig, decisionTypeOrder, priorityConfig, sensorMeta, sensorOrder } from "../theme";

export interface ConditionRow {
  sensor: string;
  operator: string;
  value: number;
}

export interface FormData {
  name: string;
  description: string;
  decision_type: string;
  priority: number;
  action: string;
  condition_operator: string;
  conditions: ConditionRow[];
}

interface Props {
  initial?: FormData;
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}

const operators = [
  { value: "lt", label: "<" },
  { value: "le", label: "<=" },
  { value: "eq", label: "=" },
  { value: "ge", label: ">=" },
  { value: "gt", label: ">" },
  { value: "ne", label: "!=" },
];

const defaultCondition = { sensor: "temperature", operator: "gt", value: 30 };

export default function RuleEditor({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormData>(() => initial ?? {
    name: "",
    description: "",
    decision_type: "irrigation",
    priority: 3,
    action: "",
    condition_operator: "and",
    conditions: [{ ...defaultCondition }],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initial;

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateCond = (i: number, key: keyof ConditionRow, value: string | number) =>
    setForm((prev) => {
      const c = [...prev.conditions];
      c[i] = { ...c[i], [key]: value };
      return { ...prev, conditions: c };
    });

  const addCond = () =>
    setForm((prev) => ({ ...prev, conditions: [...prev.conditions, { ...defaultCondition }] }));

  const removeCond = (i: number) =>
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.length > 1 ? prev.conditions.filter((_, idx) => idx !== i) : prev.conditions,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (form.conditions.length === 0) { setError("At least one condition is required"); return; }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl glass-strong p-6 relative animate-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-100">
            {isEditing ? `Edit Rule: ${initial.name}` : "New Rule"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={isEditing}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Type</label>
              <select
                value={form.decision_type}
                onChange={(e) => set("decision_type", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                {decisionTypeOrder.map((t) => (
                  <option key={t} value={t}>{decisionTypeConfig[t]?.label ?? t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                {[1, 2, 3, 4].map((p) => (
                  <option key={p} value={p}>{priorityConfig[p]?.label} ({p})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Condition Logic</label>
              <select
                value={form.condition_operator}
                onChange={(e) => set("condition_operator", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="and">ALL (AND)</option>
                <option value="or">ANY (OR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Action / Recommendation</label>
            <textarea
              value={form.action}
              onChange={(e) => set("action", e.target.value)}
              rows={3}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Conditions ({form.condition_operator === "and" ? "ALL must match" : "ANY must match"})</label>
              <button type="button" onClick={addCond} className="flex items-center gap-1 text-[10px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {form.conditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <select
                    value={cond.sensor}
                    onChange={(e) => updateCond(i, "sensor", e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    {sensorOrder.map((s) => (
                      <option key={s} value={s}>{sensorMeta[s]?.label} ({sensorMeta[s]?.short})</option>
                    ))}
                  </select>
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCond(i, "operator", e.target.value)}
                    className="w-16 px-1.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    {operators.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    value={cond.value}
                    onChange={(e) => updateCond(i, "value", parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                  <span className="text-[10px] font-mono text-slate-500 w-8">{sensorMeta[cond.sensor]?.unit ?? ""}</span>
                  <button type="button" onClick={() => removeCond(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/60 border border-slate-700/60 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 disabled:opacity-50 transition-all"
            >
              {saving ? "Saving..." : isEditing ? "Update Rule" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
