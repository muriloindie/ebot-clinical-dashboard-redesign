"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Stethoscope } from "lucide-react";
import gsap from "gsap";
import { sidebarNavigation, type SidebarGroupConfig } from "@/data/sidebarNavigation";
import { cn } from "@/lib/cn";
import logo from "@/assets/icon.png";
import { SidebarNavItem } from "./SidebarNavItem";

type PrimarySidebarProps = {
  activeGroupId: string;
  selectedGroupId: string;
  secondaryOpen: boolean;
  onSelectGroup: (group: SidebarGroupConfig) => void;
};

export function PrimarySidebar({ activeGroupId, selectedGroupId, secondaryOpen, onSelectGroup }: PrimarySidebarProps) {
  const desktopRef = useRef<HTMLElement>(null);
  const mobileRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(desktopRef.current, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.42, ease: "power3.out" });
      gsap.fromTo(
        "[data-primary-nav-item]",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.42, ease: "power3.out", stagger: 0.045, delay: 0.1 }
      );
    }, desktopRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!mobileRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(mobileRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.36, ease: "power3.out" });
  }, []);

  return (
    <>
      <aside
        ref={desktopRef}
        className="fixed left-3 top-3 z-50 hidden h-[calc(100vh-24px)] w-[116px] flex-col rounded-[30px] border border-clinical-blue/[0.18] bg-[#DFF2FA]/[0.90] px-2.5 py-3 shadow-[0_24px_60px_rgba(33,68,86,0.10)] opacity-0 backdrop-blur-[18px] dark:border-white/[0.08] dark:bg-[#1C343B]/[0.88] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] md:flex"
        aria-label="Navegação principal"
      >
        <button
          type="button"
          onClick={() => onSelectGroup(sidebarNavigation[0])}
          className="mb-4 flex items-center justify-center rounded-[24px] border border-white/70 bg-white/82 px-2 py-3 shadow-[0_12px_30px_rgba(58,157,202,0.12)] transition hover:-translate-y-0.5 hover:border-white hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-blue/35 dark:border-white/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
          aria-label="Ir para o Dashboard Ê-Bot Clinical"
        >
          <span className="relative flex size-14 items-center justify-center overflow-hidden rounded-[22px] bg-white shadow-[0_12px_26px_rgba(58,157,202,0.16)] dark:bg-white/[0.92]">
            <Image src={logo} alt="Ê-Bot Clinical" className="size-8 object-contain" priority />
          </span>
        </button>

        <nav className="flex flex-1 flex-col justify-center gap-2" aria-label="Módulos principais">
          {sidebarNavigation.map((group) => (
            <SidebarNavItem
              key={group.id}
              group={group}
              active={activeGroupId === group.id}
              selected={selectedGroupId === group.id}
              expanded={secondaryOpen && selectedGroupId === group.id}
              onSelect={onSelectGroup}
            />
          ))}
        </nav>

        <div className="mt-4 rounded-[22px] border border-white/70 bg-white/68 px-2 py-2.5 text-center shadow-[0_10px_24px_rgba(58,157,202,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <Stethoscope className="mx-auto size-4 text-clinical-green" />
          <p className="mt-1 text-[10px] font-black leading-none text-clinical-blueText dark:text-white/82">Clínica</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-[0.06em] text-clinical-green">
            <span className="size-1.5 rounded-full bg-clinical-green" /> Online
          </p>
        </div>
      </aside>

      <nav
        ref={mobileRef}
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-6 gap-1.5 rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/[0.9] p-2 opacity-0 shadow-[0_18px_54px_rgba(30,62,72,0.16)] backdrop-blur-2xl dark:border-white/[0.08] md:hidden"
        aria-label="Navegação principal mobile"
      >
        {sidebarNavigation.map((group) => {
          const Icon = group.icon;
          const active = activeGroupId === group.id;

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectGroup(group)}
              aria-label={`Abrir módulo ${group.label}`}
              aria-expanded={selectedGroupId === group.id && secondaryOpen}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-1.5 py-2 text-[10px] font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-blue/35",
                active ? "bg-clinical-blue text-white shadow-[0_10px_24px_rgba(58,157,202,0.28)]" : "text-clinical-muted hover:bg-clinical-blue/[0.10] hover:text-clinical-blue"
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className="max-w-full truncate">{group.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
