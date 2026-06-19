import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import clsx from "clsx";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import StatusDot from "./StatusDot";

interface Props {
  label: string;
  value: number;
  unit: string;
  trend: number;
  status: "ok" | "warning" | "critical" | "unknown";
  data: number[];
  icon: LucideIcon;
  accent: string;
  detail?: string;
}

export default function KpiTile({ label, value, unit, trend, status, data, icon: Icon, accent, detail }: Props) {
  const trendIcon = trend > 0.5 ? TrendingUp : trend < -0.5 ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor =
    trend > 0.5
      ? "text-amber-400"
      : trend < -0.5
        ? "text-emerald-400"
        : "text-slate-500";

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div className="glass lift p-4 relative overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </span>
        </div>
        <StatusDot status={status} size="sm" />
      </div>

      <div className="mt-3 relative z-10">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold font-mono tabular-nums text-slate-50">
            {typeof value === "number" ? value.toFixed(value < 10 ? 2 : 1) : value}
          </span>
          <span className="text-sm font-mono text-slate-500">{unit}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <TrendIcon className={clsx("w-3 h-3", trendColor)} />
          <span className={clsx("text-[11px] font-mono", trendColor)}>
            {trend > 0 ? "+" : ""}
            {trend.toFixed(2)}
          </span>
          {detail && (
            <span className="text-[10px] text-slate-500 ml-1.5 truncate">{detail}</span>
          )}
        </div>
      </div>

      <div className="h-10 mt-3 -mx-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Line
              type="monotone"
              dataKey="v"
              stroke={accent}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
