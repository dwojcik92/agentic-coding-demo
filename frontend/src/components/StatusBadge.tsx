import clsx from "clsx";
import { statusColors } from "../theme";

interface Props {
  status: "ok" | "warning" | "critical" | "unknown";
  label: string;
  className?: string;
}

export default function StatusBadge({ status, label, className }: Props) {
  const colors = statusColors[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      <span className={clsx("w-1 h-1 rounded-full", colors.dot)} />
      {label}
    </span>
  );
}
