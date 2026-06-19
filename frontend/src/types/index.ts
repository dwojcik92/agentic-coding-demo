export interface SensorEval {
  status: string;
  value: number;
  deviation: number;
  unit: string;
  sensor_name: string;
  threshold: {
    min: number | null;
    max: number | null;
    optimal_min: number | null;
    optimal_max: number | null;
  };
  detail: string;
}

export interface DecisionOutput {
  type: string;
  action: string;
  priority: number;
  explanation: string;
  sensor_readings: Record<string, number>;
  conditions_met: string[];
}

export interface ExpertResult {
  sensor_evaluations: Record<string, SensorEval>;
  decisions: DecisionOutput[];
  growth_stage: string;
  crop: string;
}

export interface SensorReading {
  id: number;
  sensor_name: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface DecisionRecord {
  id: number;
  decision_type: string;
  action: string;
  priority: number;
  explanation: string;
  growth_stage: string;
  sensor_snapshot: string;
  timestamp: string;
}
