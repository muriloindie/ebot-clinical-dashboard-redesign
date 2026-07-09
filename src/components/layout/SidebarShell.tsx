"use client";

import { useEffect, useMemo, useState } from "react";
import {
  findSidebarGroupByPath,
  getSidebarGroupDefaultPath,
  sidebarNavigation,
  type SidebarGroupConfig
} from "@/data/sidebarNavigation";
import { cn } from "@/lib/cn";
import { PrimarySidebar } from "./PrimarySidebar";
import { SecondarySidebar } from "./SecondarySidebar";

type SidebarShellProps = {
  activePath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
};

export function SidebarShell({ activePath, onNavigate, children }: SidebarShellProps) {
  const activeGroup = useMemo(() => findSidebarGroupByPath(activePath) ?? sidebarNavigation[0], [activePath]);
  const [selectedGroupId, setSelectedGroupId] = useState(activeGroup.id);
  const [secondaryOpen, setSecondaryOpen] = useState(true);

  const selectedGroup = useMemo(
    () => sidebarNavigation.find((group) => group.id === selectedGroupId) ?? activeGroup,
    [activeGroup, selectedGroupId]
  );

  const hasSecondary = secondaryOpen && selectedGroup.items.length > 0;

  useEffect(() => {
    setSelectedGroupId(activeGroup.id);
    if (activeGroup.items.length > 0) setSecondaryOpen(true);
  }, [activeGroup.id, activeGroup.items.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSecondaryOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelectGroup(group: SidebarGroupConfig) {
    setSelectedGroupId(group.id);
    if (group.items.length > 0) setSecondaryOpen(true);
    else setSecondaryOpen(false);

    const nextPath = getSidebarGroupDefaultPath(group);
    if (nextPath !== activePath) onNavigate(nextPath);
  }

  function handleSecondaryNavigate(path: string) {
    onNavigate(path);
    setSecondaryOpen(true);
  }

  return (
    <div className="relative min-h-screen">
      <PrimarySidebar
        activeGroupId={activeGroup.id}
        selectedGroupId={selectedGroup.id}
        secondaryOpen={hasSecondary}
        onSelectGroup={handleSelectGroup}
      />
      <SecondarySidebar
        group={selectedGroup}
        activePath={activePath}
        open={hasSecondary}
        onClose={() => setSecondaryOpen(false)}
        onNavigate={handleSecondaryNavigate}
      />

      <section
        className={cn(
          "min-w-0 pb-28 transition-[padding-left] duration-[340ms] ease-out md:pb-0",
          hasSecondary ? "md:pl-[456px]" : "md:pl-[140px]"
        )}
      >
        {children}
      </section>
    </div>
  );
}
