const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function simulationStep(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/simulator/step`, { method: "POST" });
}

export async function resetSimulation(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/simulator/reset`, { method: "POST" });
}

export async function getDecisionHistory(limit = 50): Promise<Response> {
  return fetch(`${API_URL}/api/v1/decisions?limit=${limit}`);
}

export async function getSensorReadings(sensor: string, limit = 100): Promise<Response> {
  return fetch(`${API_URL}/api/v1/sensors/${sensor}/readings?limit=${limit}`);
}

export async function getSensorList(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/simulator/sensors`);
}
