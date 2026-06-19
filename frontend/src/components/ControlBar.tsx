import { Pause, Play, RotateCcw, StepForward, Gauge } from "lucide-react";
import clsx from "clsx";

interface Props {
  running: boolean;
  loading: boolean;
  stepCount: number;
  speed: number;
  onToggle: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (ms: number) => void;
}

const speedOptions = [
  { ms: 3000, label: "0.5x" },
  { ms: 1500, label: "1x" },
  { ms: 750, label: "2x" },
  { ms: 300, label: "5x" },
];

export default function ControlBar({ running, loading, stepCount, speed, onToggle, onStep, onReset, onSpeedChange }: Props) {
  return (
    <div className="glass flex items-center gap-1.5 p-1.5 rounded-xl">
      <button
        onClick={onToggle}
        className={clsx(
          "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all",
          running
            ? "bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30"
            : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30"
        )}
        title={running ? "Pause simulation" : "Start simulation"}
      >
        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span>{running ? "Pause" : "Stream"}</span>
      </button>

      <button
        onClick={onStep}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700/40 border border-slate-700/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        title="Advance one step"
      >
        <StepForward className="w-4 h-4" />
        <span>Step</span>
      </button>

      <div className="w-px h-6 bg-slate-700/60 mx-1" />

      <div className="flex items-center gap-1 px-1.5">
        <Gauge className="w-3.5 h-3.5 text-slate-500" />
        {speedOptions.map((opt) => (
          <button
            key={opt.ms}
            onClick={() => onSpeedChange(opt.ms)}
            className={clsx(
              "px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all",
              speed === opt.ms
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-slate-700/60 mx-1" />

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700/40 border border-slate-700/40 transition-all"
        title="Reset simulation"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>

      <div className="px-3 py-1.5 ml-1 rounded-md bg-slate-800/60 border border-slate-700/40 font-mono text-[11px] text-slate-400">
        <span className="text-slate-500">step</span>{" "}
        <span className="text-slate-200 font-semibold tabular-nums">{stepCount.toString().padStart(4, "0")}</span>
      </div>
    </div>
  );
}
