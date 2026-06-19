import { useCallback, useEffect, useRef, useState } from "react";
import type { ExpertResult } from "../types";
import { simulationStep, resetSimulation } from "../api/client";

export function useSensorStream(initialSpeed = 1500) {
  const [currentResult, setCurrentResult] = useState<ExpertResult | null>(null);
  const [history, setHistory] = useState<ExpertResult[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const intervalRef = useRef<number | null>(null);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => step(), speed);
    }
  }, [speed]);

  const step = useCallback(async () => {
    setLoading(true);
    try {
      const res = await simulationStep();
      const data: ExpertResult = await res.json();
      setCurrentResult(data);
      setHistory((prev) => {
        const next = [...prev, data];
        return next.length > 120 ? next.slice(-120) : next;
      });
    } catch {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRunning(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    step();
    intervalRef.current = window.setInterval(step, speedRef.current);
    setRunning(true);
  }, [step]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback(async () => {
    stop();
    try {
      await resetSimulation();
    } catch {
      // ignore
    }
    setCurrentResult(null);
    setHistory([]);
  }, [stop]);

  const toggle = useCallback(() => {
    if (running) stop();
    else start();
  }, [running, start, stop]);

  return {
    currentResult,
    history,
    running,
    loading,
    speed,
    stepCount: history.length,
    step,
    start,
    stop,
    toggle,
    reset,
    setSpeed,
  };
}
