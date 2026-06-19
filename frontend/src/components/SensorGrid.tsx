import {
  Droplet,
  Thermometer,
  Cloud,
  Sun,
  FlaskConical,
  Atom,
  Wind,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import clsx from "clsx";
import { sensorMeta, sensorOrder } from "../theme";
import type { ExpertResult } from "../types";

const iconMap: Record<string, LucideIcon> = {
  soil_moisture: Droplet,
  temperature: Thermometer,
  humidity: Cloud,
  light_intensity: Sun,
  soil_ph: FlaskConical,
  nitrogen: Atom,
  wind_speed: Wind,
};

function statusOf(evalRes: { status: string } | undefined): "ok" | "warning" | "critical" | "unknown" {
  if (!evalRes) return "unknown";
  return evalRes.status as "ok" | "warning" | "critical";
}

interface Props {
  current: ExpertResult | null;
  history: ExpertResult[];
}

export default function SensorGrid({ current, history }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
      {sensorOrder.map((sensor) => {
        const meta = sensorMeta[sensor];
        const Icon = iconMap[sensor] ?? Droplet;
        const evalRes = current?.sensor_evaluations[sensor];
        const status = statusOf(evalRes);
        const value = evalRes?.value ?? 0;

        const data = history.slice(-30).map((h, i) => ({
          i,
          v: h.sensor_evaluations[sensor]?.value ?? 0,
        }));

        const prev =
          history.length > 1
            ? history[history.length - 2].sensor_evaluations[sensor]?.value
            : null;
        const delta = prev !== null && evalRes ? evalRes.value - prev : 0;

        return (
          <div
            key={sensor}
            className="glass lift p-3 relative overflow-hidden cursor-pointer"
          >
            <div
              className={clsx(
                "absolute inset-x-0 top-0 h-0.5",
                status === "critical" && "bg-red-500",
                status === "warning" && "bg-amber-500",
                status === "ok" && "bg-emerald-500",
                status === "unknown" && "bg-slate-700"
              )}
            />

            <div className="flex items-center justify-between mb-1.5">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}35` }}
              >
                <Icon className="w-3 h-3" style={{ color: meta.color }} />
              </div>
              <div
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  status === "critical" && "bg-red-400",
                  status === "warning" && "bg-amber-400 pulse-dot",
                  status === "ok" && "bg-emerald-400",
                  status === "unknown" && "bg-slate-600"
                )}
              />
            </div>

            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 truncate">
              {meta.label}
            </p>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold font-mono tabular-nums text-slate-50">
                {evalRes ? value.toFixed(value < 10 ? 1 : 0) : "—"}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{meta.unit}</span>
            </div>

            {evalRes && delta !== 0 && (
              <div className="flex items-center gap-0.5 mt-0.5">
                {delta > 0 ? (
                  <ArrowUpRight className="w-2.5 h-2.5 text-amber-400" />
                ) : (
                  <ArrowDownRight className="w-2.5 h-2.5 text-emerald-400" />
                )}
                <span
                  className={clsx(
                    "text-[10px] font-mono",
                    delta > 0 ? "text-amber-400" : "text-emerald-400"
                  )}
                >
                  {Math.abs(delta).toFixed(1)}
                </span>
              </div>
            )}

            <div className="h-7 mt-1.5 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`sg-${sensor}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={meta.color} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={meta.color}
                    strokeWidth={1.4}
                    fill={`url(#sg-${sensor})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
