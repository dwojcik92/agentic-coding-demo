import clsx from "clsx";
import { statusColors } from "../theme";

interface Props {
  status: "ok" | "warning" | "critical" | "unknown";
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StatusDot({ status, pulse = false, size = "md", className }: Props) {
  const colors = statusColors[status];
  const sizeClass = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  }[size];

  return (
    <span className={clsx("relative inline-flex", className)}>
      <span
        className={clsx(
          "rounded-full",
          sizeClass,
          colors.dot,
          pulse && "pulse-dot"
        )}
      />
      {pulse && (
        <span
          className={clsx(
            "absolute inset-0 rounded-full",
            sizeClass,
            colors.dot,
            "opacity-30 animate-ping"
          )}
        />
      )}
    </span>
  );
}
