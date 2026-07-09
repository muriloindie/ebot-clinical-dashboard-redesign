"use client";

import type { SidebarItemConfig } from "@/data/sidebarNavigation";
import { cn } from "@/lib/cn";

type SecondaryNavItemProps = {
  item: SidebarItemConfig;
  active: boolean;
  onNavigate: (path: string) => void;
};

export function SecondaryNavItem({ item, active, onNavigate }: SecondaryNavItemProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      data-secondary-nav-item
      onClick={() => onNavigate(item.path)}
      aria-label={`Abrir ${item.label}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-[20px] border px-3.5 py-3.5 text-left transition duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-blue/35",
        active
          ? "border-clinical-blue/25 bg-white text-clinical-blueText shadow-[0_14px_34px_rgba(58,157,202,0.12)] dark:bg-clinical-blue/[0.14] dark:text-clinical-blue"
          : "border-white/50 bg-white/[0.46] text-clinical-slate hover:translate-x-[3px] hover:border-clinical-blue/14 hover:bg-white/[0.78] hover:text-clinical-dark dark:border-white/[0.04] dark:bg-white/[0.035] dark:text-clinical-muted dark:hover:bg-white/[0.07] dark:hover:text-clinical-dark"
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-[1.05]",
          active
            ? "bg-clinical-blue text-white shadow-[0_12px_24px_rgba(58,157,202,0.22)]"
            : "bg-clinical-blue/[0.08] text-clinical-blueText shadow-[inset_0_0_0_1px_rgba(58,157,202,0.08)] dark:bg-white/[0.05] dark:text-clinical-blue dark:shadow-none"
        )}
      >
        <Icon className="size-[18px] stroke-[2.1]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-extrabold leading-5 tracking-[-0.01em]">{item.label}</span>
        {item.description ? <span className="mt-0.5 block text-[12px] font-semibold leading-4 text-clinical-muted">{item.description}</span> : null}
      </span>

      {active ? <span className="size-2.5 shrink-0 rounded-full bg-clinical-blue shadow-[0_0_14px_rgba(58,157,202,0.55)]" aria-hidden="true" /> : null}
    </button>
  );
}
