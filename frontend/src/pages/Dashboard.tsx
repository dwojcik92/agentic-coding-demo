import { useEffect } from "react";
import { useSensorStream } from "../hooks/useSensorStream";
import type { DecisionOutput } from "../types";
import SensorChart from "../components/SensorChart";
import DecisionCard from "../components/DecisionCard";

const sensors = [
  { key: "soil_moisture", label: "Soil Moisture", unit: "%", color: "#0ea5e9" },
  { key: "temperature", label: "Temperature", unit: "°C", color: "#f97316" },
  { key: "humidity", label: "Humidity", unit: "%", color: "#8b5cf6" },
  { key: "light_intensity", label: "Light Intensity", unit: " W/m²", color: "#eab308" },
  { key: "soil_ph", label: "Soil pH", unit: "", color: "#22c55e", domain: [0, 14] as [number, number] },
  { key: "nitrogen", label: "Nitrogen", unit: " mg/kg", color: "#06b6d4" },
  { key: "wind_speed", label: "Wind Speed", unit: " km/h", color: "#ec4899" },
];

const decisionTypeOrder = [
  "irrigation",
  "fertilization",
  "plant_stress",
  "disease_risk",
  "growth_quality",
  "observation",
];

export default function Dashboard() {
  const { currentResult, history, running, loading, step, toggle, reset } =
    useSensorStream();

  useEffect(() => {
    if (!running && history.length === 0) {
      step();
    }
  }, []);

  const groupedDecisions: Record<string, DecisionOutput[]> = {};
  if (currentResult) {
    for (const d of currentResult.decisions) {
      if (!groupedDecisions[d.type]) groupedDecisions[d.type] = [];
      groupedDecisions[d.type].push(d);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Expert System — Precision Agriculture
            </h1>
            <p className="text-sm text-gray-500">
              Crop: {currentResult?.crop ?? "Tomato"} &middot;
              Stage: {currentResult?.growth_stage ?? "fruiting"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={step}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "..." : "Step"}
            </button>
            <button
              onClick={() => toggle(1500)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg text-white ${
                running
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-cyan-500 hover:bg-cyan-600"
              }`}
            >
              {running ? "Stop" : "Auto"}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {history.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No data yet. Click <strong>Step</strong> to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Sensor Readings Over Time
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sensors.map((s) => (
                    <SensorChart
                      key={s.key}
                      history={history}
                      sensorName={s.key}
                      label={s.label}
                      unit={s.unit}
                      color={s.color}
                      domain={s.domain as [number, number] | undefined}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Current Sensor Status
                </h2>
                {currentResult && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(currentResult.sensor_evaluations).map(
                      ([key, evalRes]) => (
                        <div
                          key={key}
                          className={`rounded-lg p-3 text-sm border ${
                            evalRes.status === "critical"
                              ? "bg-red-50 border-red-200"
                              : evalRes.status === "warning"
                                ? "bg-amber-50 border-amber-200"
                                : "bg-green-50 border-green-200"
                          }`}
                        >
                          <p className="font-medium text-gray-700">{key.replace(/_/g, " ")}</p>
                          <p className="text-lg font-bold font-mono mt-1">
                            {evalRes.value}
                            {evalRes.unit}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{evalRes.detail}</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Decisions</h2>
              {currentResult && currentResult.decisions.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  All parameters optimal. No decisions required.
                </p>
              ) : (
                decisionTypeOrder.map(
                  (type) =>
                    groupedDecisions[type] &&
                    groupedDecisions[type].map((d, i) => (
                      <DecisionCard key={`${type}-${i}`} decision={d} />
                    ))
                )
              )}

              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  History ({history.length} steps)
                </summary>
                <div className="mt-1 max-h-60 overflow-y-auto space-y-1">
                  {[...history].reverse().map((h, i) => (
                    <p key={i} className="border-b border-gray-100 pb-1">
                      Step {history.length - i}:{" "}
                      {h.decisions.length > 0
                        ? `${h.decisions.length} decisions`
                        : "no decisions"}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
