import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExpertResult } from "../types";

interface Props {
  history: ExpertResult[];
  sensorName: string;
  label: string;
  unit: string;
  color?: string;
  domain?: [number, number];
}

export default function SensorChart({
  history,
  sensorName,
  label,
  unit,
  color = "#06b6d4",
  domain,
}: Props) {
  const data = history.map((h, i) => ({
    step: i,
    value: h.sensor_evaluations[sensorName]?.value ?? 0,
  }));

  const latest =
    history.length > 0
      ? history[history.length - 1].sensor_evaluations[sensorName]
      : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        {latest && (
          <span
            className={`text-sm font-mono ${
              latest.status === "critical"
                ? "text-red-600"
                : latest.status === "warning"
                  ? "text-amber-600"
                  : "text-green-600"
            }`}
          >
            {latest.value}
            {unit}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${sensorName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="step" hide />
          <YAxis
            domain={domain ?? ["dataMin - 5", "dataMax + 5"]}
            tick={{ fontSize: 10 }}
            width={35}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${sensorName})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
