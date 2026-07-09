"use client";

import type { SidebarGroupConfig } from "@/data/sidebarNavigation";
import { cn } from "@/lib/cn";

type SidebarNavItemProps = {
  group: SidebarGroupConfig;
  active: boolean;
  selected: boolean;
  expanded: boolean;
  onSelect: (group: SidebarGroupConfig) => void;
};

export function SidebarNavItem({ group, active, selected, expanded, onSelect }: SidebarNavItemProps) {
  const Icon = group.icon;
  const hasItems = group.items.length > 0;

  return (
    <button
      type="button"
      data-primary-nav-item
      onClick={() => onSelect(group)}
      aria-label={`Abrir módulo ${group.label}`}
      aria-expanded={hasItems ? expanded : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-[76px] w-full flex-col items-center justify-center gap-1.5 rounded-[23px] border px-1 py-2 text-center transition duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-blue/45",
        active || selected
          ? "border-clinical-blue/25 bg-white text-clinical-blueText shadow-[0_14px_34px_rgba(58,157,202,0.16)] dark:border-clinical-blue/30 dark:bg-white/[0.10] dark:text-clinical-blue"
          : "border-transparent text-clinical-blueText/85 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/42 hover:text-clinical-blueText dark:text-white/76 dark:hover:border-white/10 dark:hover:bg-white/[0.08] dark:hover:text-white"
      )}
    >
      {active || selected ? (
        <span className="absolute inset-1 rounded-[20px] border border-clinical-blue/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.70)] dark:border-white/[0.06] dark:shadow-none" aria-hidden="true" />
      ) : null}
      <span
        className={cn(
          "relative z-10 flex size-10 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-[1.05]",
          active || selected
            ? "bg-clinical-blue/[0.12] text-clinical-blue shadow-[inset_0_0_0_1px_rgba(58,157,202,0.14)] dark:bg-clinical-blue/[0.16]"
            : "bg-white/54 text-clinical-blueText shadow-[inset_0_0_0_1px_rgba(58,157,202,0.10)] group-hover:bg-white/80 group-hover:text-clinical-blue dark:bg-white/[0.06] dark:text-white/74 dark:shadow-none dark:group-hover:bg-white/[0.10] dark:group-hover:text-white"
        )}
      >
        <Icon className="size-5 stroke-[2.15]" />
      </span>
      <span className="relative z-10 block max-w-[92px] truncate whitespace-nowrap text-[10.5px] font-black leading-none tracking-[-0.045em]">
        {group.label}
      </span>
      {active ? <span className="relative z-10 size-1.5 rounded-full bg-clinical-blue shadow-[0_0_12px_rgba(58,157,202,0.60)]" /> : null}
    </button>
  );
}
