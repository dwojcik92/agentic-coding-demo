import { LayoutDashboard, ScrollText, BookOpen, Database } from "lucide-react";
import clsx from "clsx";

export type TabId = "dashboard" | "decisions" | "rules" | "knowledge";

interface Tab {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
}

const tabs: Tab[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "decisions", label: "Decisions", icon: ScrollText },
  { id: "rules", label: "Rules", icon: BookOpen },
  { id: "knowledge", label: "Knowledge Base", icon: Database },
];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
  badge?: Partial<Record<TabId, number>>;
}

export default function TabBar({ active, onChange, badge }: Props) {
  return (
    <div className="glass p-1 rounded-xl flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const count = badge?.[tab.id];
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              isActive
                ? "bg-cyan-500/15 text-cyan-300 shadow-sm border border-cyan-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={clsx(
                  "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-slate-700/60 text-slate-300"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
