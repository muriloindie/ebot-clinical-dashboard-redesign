"use client";

import { useEffect, useRef } from "react";
import { PanelLeftClose } from "lucide-react";
import gsap from "gsap";
import type { SidebarGroupConfig } from "@/data/sidebarNavigation";
import { cn } from "@/lib/cn";
import { SecondaryNavItem } from "./SecondaryNavItem";

type SecondarySidebarProps = {
  group: SidebarGroupConfig;
  activePath: string;
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
};

function SecondaryPanel({ group, activePath, mobile, onClose, onNavigate }: Omit<SecondarySidebarProps, "open"> & { mobile?: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const Icon = group.icon;

  useEffect(() => {
    if (!panelRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, x: mobile ? 0 : -12, y: mobile ? 14 : 0, scale: 0.98 },
        { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.34, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-secondary-header], [data-secondary-nav-item]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power3.out", stagger: 0.04, delay: 0.06 }
      );
    }, contentRef);

    return () => ctx.revert();
  }, [group.id, mobile]);

  return (
    <div
      ref={panelRef}
      id="secondary-navigation-panel"
      className={cn(
        "flex flex-col overflow-hidden rounded-[30px] border border-clinical-blue/[0.10] bg-[#EEF4F6]/[0.94] shadow-[0_24px_70px_rgba(38,53,50,0.11)] backdrop-blur-[18px] dark:border-white/[0.08] dark:bg-[#263230]/[0.90] dark:shadow-[0_24px_70px_rgba(0,0,0,0.36)]",
        mobile ? "max-h-[calc(100vh-116px)] w-full" : "h-full w-[300px]"
      )}
      aria-label={`Navegação secundária de ${group.label}`}
    >
      <div ref={contentRef} className="flex min-h-0 flex-1 flex-col p-[18px]">
        <div data-secondary-header className="mb-4 rounded-[24px] border border-white/70 bg-white/[0.72] p-4 shadow-[0_14px_34px_rgba(58,157,202,0.07)] dark:border-white/[0.06] dark:bg-white/[0.045] dark:shadow-none">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-clinical-blue/[0.12] text-clinical-blue shadow-[inset_0_0_0_1px_rgba(58,157,202,0.12)] dark:bg-clinical-blue/[0.16]">
                <Icon className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-clinical-blueText">Módulo</p>
                <h2 className="truncate text-xl font-black tracking-[-0.03em] text-clinical-dark">{group.label}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Recolher navegação secundária"
              className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-clinical-blue/10 bg-white/74 text-clinical-muted transition hover:border-clinical-blue/25 hover:bg-clinical-blue/[0.08] hover:text-clinical-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-blue/35 dark:border-white/[0.08] dark:bg-white/[0.05]"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>
          <p className="text-[13px] font-semibold leading-5 text-clinical-muted">{group.description}</p>
        </div>

        <nav className="clinical-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1.5" aria-label={`Páginas de ${group.label}`}>
          {group.items.map((item) => (
            <SecondaryNavItem key={item.id} item={item} active={activePath === item.path} onNavigate={onNavigate} />
          ))}
        </nav>
      </div>
    </div>
  );
}

export function SecondarySidebar({ group, activePath, open, onClose, onNavigate }: SecondarySidebarProps) {
  if (!open || !group.items.length) return null;

  return (
    <>
      <aside className="fixed left-[140px] top-3 z-40 hidden h-[calc(100vh-24px)] md:block">
        <SecondaryPanel group={group} activePath={activePath} onClose={onClose} onNavigate={onNavigate} />
      </aside>

      <div className="fixed inset-0 z-40 bg-clinical-charcoal/28 backdrop-blur-[2px] md:hidden" onClick={onClose} aria-hidden="true" />
      <aside className="fixed inset-x-3 bottom-[92px] z-50 md:hidden">
        <SecondaryPanel group={group} activePath={activePath} mobile onClose={onClose} onNavigate={onNavigate} />
      </aside>
    </>
  );
}
