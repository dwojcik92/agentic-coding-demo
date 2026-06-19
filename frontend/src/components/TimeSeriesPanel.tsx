import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExpertResult } from "../types";
import { sensorMeta, sensorOrder } from "../theme";
import { Maximize2 } from "lucide-react";

interface Props {
  history: ExpertResult[];
  height?: number;
}

interface ChartRow {
  i: number;
  [key: string]: number;
}

function normalize(value: number, min: number | null, max: number | null): number {
  if (min === null || max === null) return 50;
  if (max === min) return 50;
  const pct = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export default function TimeSeriesPanel({ history, height = 340 }: Props) {
  const data = useMemo<ChartRow[]>(() => {
    return history.map((h, i) => {
      const row: ChartRow = { i };
      for (const sensor of sensorOrder) {
        const evalRes = h.sensor_evaluations[sensor];
        const meta = sensorMeta[sensor];
        if (!evalRes || !meta) continue;
        row[sensor] = normalize(
          evalRes.value,
          evalRes.threshold.optimal_min,
          evalRes.threshold.optimal_max
        );
      }
      return row;
    });
  }, [history]);

  const latest = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="glass-strong p-5 relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100">Sensor Telemetry</h2>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized to optimal range per growth stage
            {latest && ` · step ${history.length - 1}`}
          </p>
        </div>
        <button
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Expand"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {sensorOrder.map((sensor) => (
              <linearGradient
                key={sensor}
                id={`ts-glow-${sensor}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={sensorMeta[sensor].color} stopOpacity={0.7} />
                <stop offset="100%" stopColor={sensorMeta[sensor].color} stopOpacity={0.15} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(31, 41, 66, 0.5)" strokeDasharray="3 4" />
          <XAxis
            dataKey="i"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(31, 41, 66, 0.5)" }}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={32}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ stroke: "rgba(34, 211, 238, 0.3)", strokeWidth: 1 }}
            contentStyle={{ background: "rgba(15, 21, 37, 0.95)", border: "1px solid #2a3556", borderRadius: "8px" }}
            labelStyle={{ color: "#a0aec8", fontSize: 11, fontFamily: "IBM Plex Mono" }}
            itemStyle={{ color: "#e6edf7", fontSize: 11, fontFamily: "IBM Plex Mono" }}
            labelFormatter={(v) => `step ${v}`}
            formatter={(value: number, name: string) => {
              const meta = sensorMeta[name];
              return [`${value.toFixed(0)}%`, meta?.short ?? name];
            }}
          />
          {sensorOrder.map((sensor) => (
            <Line
              key={sensor}
              type="monotone"
              dataKey={sensor}
              stroke={sensorMeta[sensor].color}
              strokeWidth={1.6}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#0a0e1a" }}
              isAnimationActive={false}
            />
          ))}
          <Legend
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 10, paddingTop: 8, fontFamily: "IBM Plex Mono" }}
            formatter={(value: string) => (
              <span style={{ color: "#a0aec8" }}>
                {sensorMeta[value]?.short}{" "}
                <span style={{ color: "#6b7896" }}>{sensorMeta[value]?.label}</span>
              </span>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
