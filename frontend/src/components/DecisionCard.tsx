import type { DecisionOutput } from "../types";

interface Props {
  decision: DecisionOutput;
}

const typeColors: Record<string, string> = {
  irrigation: "border-blue-400 bg-blue-50",
  fertilization: "border-emerald-400 bg-emerald-50",
  plant_stress: "border-orange-400 bg-orange-50",
  disease_risk: "border-red-400 bg-red-50",
  growth_quality: "border-purple-400 bg-purple-50",
  observation: "border-gray-400 bg-gray-50",
};

const typeLabels: Record<string, string> = {
  irrigation: "Irrigation",
  fertilization: "Fertilization",
  plant_stress: "Plant Stress",
  disease_risk: "Disease Risk",
  growth_quality: "Growth Quality",
  observation: "Observation",
};

const priorityLabels: Record<number, string> = {
  1: "Urgent",
  2: "High",
  3: "Medium",
  4: "Info",
};

const priorityColors: Record<number, string> = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-blue-100 text-blue-800",
};

export default function DecisionCard({ decision }: Props) {
  const border = typeColors[decision.type] ?? "border-gray-300";
  const label = typeLabels[decision.type] ?? decision.type;
  const pLabel = priorityLabels[decision.priority] ?? "Info";
  const pColor = priorityColors[decision.priority] ?? "bg-gray-100 text-gray-800";

  return (
    <div className={`border-l-4 ${border} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pColor}`}>
          {pLabel}
        </span>
      </div>
      <p className="text-sm text-gray-800">{decision.action}</p>
      <details className="mt-2">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          Explanation
        </summary>
        <div className="mt-1 text-xs text-gray-600 space-y-1">
          <p className="font-medium">Conditions met:</p>
          <ul className="list-disc list-inside">
            {decision.conditions_met.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="font-medium mt-1">Sensor snapshot:</p>
          <pre className="text-xs bg-gray-100 p-1 rounded">
            {JSON.stringify(decision.sensor_readings, null, 1)}
          </pre>
        </div>
      </details>
    </div>
  );
}
