const API_URL = import.meta.env.VITE_API_URL || "";

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

export function createRule(data: object): Promise<Response> {
  return fetch(`${API_URL}/api/v1/rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateRule(name: string, data: object): Promise<Response> {
  return fetch(`${API_URL}/api/v1/rules/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteRule(name: string): Promise<Response> {
  return fetch(`${API_URL}/api/v1/rules/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

export function getKnowledgeBase(): Promise<Response> {
  return fetch(`${API_URL}/api/v1/knowledge-base`);
}

export function updateThreshold(stage: string, sensor: string, data: object): Promise<Response> {
  return fetch(`${API_URL}/api/v1/knowledge-base/thresholds/${encodeURIComponent(stage)}/${encodeURIComponent(sensor)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function createStage(stage: string, thresholds?: object): Promise<Response> {
  const body = thresholds ? { thresholds } : {};
  return fetch(`${API_URL}/api/v1/knowledge-base/stages/${encodeURIComponent(stage)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function deleteStage(stage: string): Promise<Response> {
  return fetch(`${API_URL}/api/v1/knowledge-base/stages/${encodeURIComponent(stage)}`, { method: "DELETE" });
}

export function createSensor(name: string, unit: string, description: string): Promise<Response> {
  return fetch(`${API_URL}/api/v1/knowledge-base/sensors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, unit, description }),
  });
}

export function updateSensor(name: string, data: object): Promise<Response> {
  return fetch(`${API_URL}/api/v1/knowledge-base/sensors/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteSensor(name: string): Promise<Response> {
  return fetch(`${API_URL}/api/v1/knowledge-base/sensors/${encodeURIComponent(name)}`, { method: "DELETE" });
}
