import { useEffect, useMemo } from "react";
import {
  Activity,
  Droplet,
  Thermometer,
  AlertTriangle,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { useSensorStream } from "../hooks/useSensorStream";
import HeroBar from "../components/HeroBar";
import ControlBar from "../components/ControlBar";
import TimeSeriesPanel from "../components/TimeSeriesPanel";
import DecisionFeed from "../components/DecisionFeed";
import SensorGrid from "../components/SensorGrid";
import KpiTile from "../components/KpiTile";
import { sensorMeta, sensorOrder } from "../theme";
import clsx from "clsx";

function statusOf(value: string | undefined): "ok" | "warning" | "critical" | "unknown" {
  if (value === "ok" || value === "warning" || value === "critical") return value;
  return "unknown";
}

function trendOf(arr: number[]): number {
  if (arr.length < 2) return 0;
  return arr[arr.length - 1] - arr[0];
}

export default function Dashboard() {
  const {
    currentResult,
    history,
    running,
    loading,
    speed,
    stepCount,
    step,
    toggle,
    reset,
    setSpeed,
  } = useSensorStream(1500);

  useEffect(() => {
    if (stepCount === 0) {
      step();
    }
  }, []);

  const series = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const sensor of sensorOrder) {
      map[sensor] = history.map(
        (h) => h.sensor_evaluations[sensor]?.value ?? 0
      );
    }
    return map;
  }, [history]);

  const latest = currentResult;
  const hasData = stepCount > 0;

  const compositeStress = useMemo(() => {
    if (!latest) return 0;
    const evals = Object.values(latest.sensor_evaluations);
    if (evals.length === 0) return 0;
    const devSum = evals.reduce(
      (acc, e) => acc + (e.status === "critical" ? 2 : e.status === "warning" ? 1 : 0),
      0
    );
    return Math.round((devSum / (evals.length * 2)) * 100);
  }, [latest]);

  const soilHealth = useMemo(() => {
    if (!latest) return 100;
    const soilSensors = ["soil_moisture", "soil_ph", "nitrogen"];
    const vals = soilSensors.map((s) => latest.sensor_evaluations[s]);
    if (vals.some((v) => !v)) return 0;
    const ok = vals.filter((v) => v!.status === "ok").length;
    return Math.round((ok / soilSensors.length) * 100);
  }, [latest]);

  const climateHealth = useMemo(() => {
    if (!latest) return 100;
    const sensors = ["temperature", "humidity", "light_intensity"];
    const vals = sensors.map((s) => latest.sensor_evaluations[s]);
    if (vals.some((v) => !v)) return 0;
    const ok = vals.filter((v) => v!.status === "ok").length;
    return Math.round((ok / sensors.length) * 100);
  }, [latest]);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
        <HeroBar current={currentResult} stepCount={stepCount} running={running} />

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <ControlBar
            running={running}
            loading={loading}
            stepCount={stepCount}
            speed={speed}
            onToggle={toggle}
            onStep={step}
            onReset={reset}
            onSpeedChange={setSpeed}
          />
          <div className="flex-1 hidden lg:block" />
          {hasData && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span>engine live</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-400">no LLM in the loop</span>
            </div>
          )}
        </div>

        {!hasData ? (
          <EmptyState onStep={step} loading={loading} />
        ) : (
          <>
            <section>
              <SectionHeader
                icon={Activity}
                title="System KPIs"
                subtitle="Composite health scores computed from sensor evaluations"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiTile
                  label="Soil Health"
                  value={soilHealth}
                  unit="%"
                  trend={trendOf(series.soil_moisture)}
                  status={statusOf(
                    soilHealth >= 80 ? "ok" : soilHealth >= 50 ? "warning" : "critical"
                  )}
                  data={series.soil_moisture}
                  icon={Droplet}
                  accent="#0ea5e9"
                  detail="moisture · pH · N"
                />
                <KpiTile
                  label="Climate Health"
                  value={climateHealth}
                  unit="%"
                  trend={trendOf(series.temperature)}
                  status={statusOf(
                    climateHealth >= 80 ? "ok" : climateHealth >= 50 ? "warning" : "critical"
                  )}
                  data={series.temperature}
                  icon={Thermometer}
                  accent="#f97316"
                  detail="temp · RH · light"
                />
                <KpiTile
                  label="Stress Index"
                  value={compositeStress}
                  unit="%"
                  trend={-trendOf(series.wind_speed) * 0.5}
                  status={statusOf(
                    compositeStress < 25 ? "ok" : compositeStress < 50 ? "warning" : "critical"
                  )}
                  data={series.wind_speed}
                  icon={AlertTriangle}
                  accent="#f59e0b"
                  detail="composite deviation"
                  // Flip detail direction
                />
                <KpiTile
                  label="Active Decisions"
                  value={latest?.decisions.length ?? 0}
                  unit=""
                  trend={latest ? latest.decisions.length : 0}
                  status={statusOf(
                    (latest?.decisions.length ?? 0) === 0
                      ? "ok"
                      : (latest?.decisions.filter((d) => d.priority <= 2).length ?? 0) > 0
                        ? "critical"
                        : "warning"
                  )}
                  data={history.map((h) => h.decisions.length)}
                  icon={ClipboardList}
                  accent="#06b6d4"
                  detail="this step"
                />
              </div>
            </section>

            <section>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2">
                  <TimeSeriesPanel history={history} />
                </div>
                <div className="xl:col-span-1 h-[480px]">
                  <DecisionFeed
                    decisions={latest?.decisions ?? []}
                    historyCount={stepCount}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader
                icon={ClipboardList}
                title="Sensor Grid"
                subtitle="Live readings with optimal-band indicators"
              />
              <SensorGrid current={currentResult} history={history} />
            </section>

            <section>
              <SectionHeader
                icon={Activity}
                title="Reasoning Trace"
                subtitle="What the expert engine saw and why"
              />
              <ReasoningTrace latest={latest} />
            </section>

            <footer className="pt-3 pb-6 text-center text-[11px] font-mono text-slate-600">
              <span className="text-slate-500">expert-system</span>
              <span className="text-slate-700 mx-2">·</span>
              <span>rule-based engine</span>
              <span className="text-slate-700 mx-2">·</span>
              <span>knowledge base: {latest?.crop ?? "tomato"}</span>
              <span className="text-slate-700 mx-2">·</span>
              <span>stage: {latest?.growth_stage ?? "fruiting"}</span>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-end justify-between mb-3 px-1">
      <div>
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-400" />
          {title}
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5 ml-6">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ onStep, loading }: { onStep: () => void; loading: boolean }) {
  return (
    <div className="glass-strong py-20 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
        <Activity className="w-8 h-8 text-cyan-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-100">Awaiting sensor stream</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        Initialize the expert engine by advancing the first step. The simulator will
        generate a reading from the tomato knowledge base and evaluate it against
        the configured rule set.
      </p>
      <button
        onClick={onStep}
        disabled={loading}
        className={clsx(
          "mt-5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
          "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
          "hover:bg-cyan-500/25 disabled:opacity-50"
        )}
      >
        {loading ? "Initializing..." : "Take first reading"}
      </button>
    </div>
  );
}

function ReasoningTrace({ latest }: { latest: { sensor_evaluations: Record<string, { sensor_name: string; value: number; unit: string; status: string; detail: string }> } | null }) {
  if (!latest) return null;
  const items = Object.values(latest.sensor_evaluations);
  return (
    <div className="glass-strong p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((ev) => {
          const meta = sensorMeta[ev.sensor_name];
          return (
            <div
              key={ev.sensor_name}
              className={clsx(
                "flex items-start gap-2.5 p-2.5 rounded-md border-l-2",
                ev.status === "critical" && "bg-red-500/5 border-red-500",
                ev.status === "warning" && "bg-amber-500/5 border-amber-500",
                ev.status === "ok" && "bg-emerald-500/5 border-emerald-500",
                ev.status === "unknown" && "bg-slate-500/5 border-slate-600"
              )}
            >
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: meta?.color ?? "#64748b" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {meta?.label ?? ev.sensor_name}
                </p>
                <p className="text-[11px] text-slate-200 leading-snug mt-0.5">
                  {ev.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
