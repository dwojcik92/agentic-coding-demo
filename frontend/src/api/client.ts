const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function json(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export function simulationStep(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/simulator/step`, { method: "POST" });
}

export function resetSimulation(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/simulator/reset`, { method: "POST" });
}

export function getDecisionHistory(limit = 50): Promise<Response> {
  return fetch(`${API_URL}/api/v1/decisions?limit=${limit}`);
}

export function getSensorReadings(sensor: string, limit = 100): Promise<Response> {
  return fetch(`${API_URL}/api/v1/sensors/${sensor}/readings?limit=${limit}`);
}

export function getSensorList(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/simulator/sensors`);
}

export function getRules(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/rules`);
}

export function getKnowledgeBase(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/knowledge-base`);
}
