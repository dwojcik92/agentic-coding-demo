import { useCallback, useRef, useState } from "react";
import type { ExpertResult } from "../types";
import { simulationStep, resetSimulation } from "../api/client";

export function useSensorStream() {
  const [currentResult, setCurrentResult] = useState<ExpertResult | null>(null);
  const [history, setHistory] = useState<ExpertResult[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const step = useCallback(async () => {
    setLoading(true);
    try {
      const res = await simulationStep();
      const data: ExpertResult = await res.json();
      setCurrentResult(data);
      setHistory((prev) => [...prev, data]);
    } finally {
      setLoading(false);
    }
  }, []);

  const start = useCallback(
    (intervalMs = 2000) => {
      if (intervalRef.current) return;
      step();
      intervalRef.current = window.setInterval(step, intervalMs);
      setRunning(true);
    },
    [step]
  );

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback(async () => {
    stop();
    await resetSimulation();
    setCurrentResult(null);
    setHistory([]);
  }, [stop]);

  const toggle = useCallback(
    (intervalMs = 2000) => {
      if (running) stop();
      else start(intervalMs);
    },
    [running, start, stop]
  );

  return { currentResult, history, running, loading, step, start, stop, toggle, reset };
}
