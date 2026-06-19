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

export interface RuleDef {
  name: string;
  description: string;
  decision_type: string;
  priority: number;
  action: string;
  condition: {
    operator: string;
    conditions: { sensor: string; operator: string; value: number }[];
  };
}

export interface RulesResponse {
  rules: RuleDef[];
}

export interface KbSensor {
  name: string;
  unit: string;
  description: string;
}

export interface KbThreshold {
  min: number | null;
  max: number | null;
  optimal_min: number | null;
  optimal_max: number | null;
}

export interface KnowledgeBaseResponse {
  crop: string;
  sensors: Record<string, KbSensor>;
  growth_stages: Record<string, Record<string, KbThreshold>>;
}
