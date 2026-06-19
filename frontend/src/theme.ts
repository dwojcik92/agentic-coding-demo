export const statusColors = {
  ok: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400", glow: "rgba(16, 185, 129, 0.4)" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400", glow: "rgba(245, 158, 11, 0.4)" },
  critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-400", glow: "rgba(239, 68, 68, 0.4)" },
  unknown: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30", dot: "bg-slate-400", glow: "rgba(100, 116, 139, 0.4)" },
} as const;

export const decisionTypeConfig = {
  irrigation: { label: "Irrigation", color: "#3b82f6", icon: "droplet", bg: "rgba(59, 130, 246, 0.08)" },
  fertilization: { label: "Fertilization", color: "#10b981", icon: "leaf", bg: "rgba(16, 185, 129, 0.08)" },
  plant_stress: { label: "Plant Stress", color: "#f97316", icon: "alert-triangle", bg: "rgba(249, 115, 22, 0.08)" },
  disease_risk: { label: "Disease Risk", color: "#ef4444", icon: "bug", bg: "rgba(239, 68, 68, 0.08)" },
  growth_quality: { label: "Growth Quality", color: "#a855f7", icon: "trending-up", bg: "rgba(168, 85, 247, 0.08)" },
  observation: { label: "Observation", color: "#94a3b8", icon: "eye", bg: "rgba(148, 163, 184, 0.08)" },
} as const;

export const priorityConfig: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Urgent", color: "#fca5a5", bg: "rgba(239, 68, 68, 0.15)" },
  2: { label: "High", color: "#fdba74", bg: "rgba(249, 115, 22, 0.15)" },
  3: { label: "Medium", color: "#fcd34d", bg: "rgba(245, 158, 11, 0.15)" },
  4: { label: "Info", color: "#93c5fd", bg: "rgba(59, 130, 246, 0.15)" },
};

export const sensorMeta: Record<string, { label: string; unit: string; color: string; short: string; group: string }> = {
  soil_moisture: { label: "Soil Moisture", unit: "%", color: "#0ea5e9", short: "SM", group: "Soil" },
  temperature: { label: "Temperature", unit: "°C", color: "#f97316", short: "T", group: "Climate" },
  humidity: { label: "Humidity", unit: "%", color: "#8b5cf6", short: "RH", group: "Climate" },
  light_intensity: { label: "Light Intensity", unit: " W/m²", color: "#eab308", short: "PAR", group: "Climate" },
  soil_ph: { label: "Soil pH", unit: "", color: "#22c55e", short: "pH", group: "Soil" },
  nitrogen: { label: "Nitrogen", unit: " mg/kg", color: "#06b6d4", short: "N", group: "Soil" },
  wind_speed: { label: "Wind Speed", unit: " km/h", color: "#ec4899", short: "WS", group: "Climate" },
};

export const sensorOrder = [
  "temperature",
  "humidity",
  "light_intensity",
  "soil_moisture",
  "soil_ph",
  "nitrogen",
  "wind_speed",
];

export const decisionTypeOrder = [
  "irrigation",
  "fertilization",
  "plant_stress",
  "disease_risk",
  "growth_quality",
  "observation",
] as const;
