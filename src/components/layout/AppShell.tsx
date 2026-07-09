"use client";

import { useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { findSidebarItemByPath, resolveSidebarPath } from "@/data/sidebarNavigation";
import { SidebarShell } from "./SidebarShell";
import { Topbar } from "./Topbar";

export function AppShell() {
  const [activePath, setActivePath] = useState("/dashboard");
  const activeItem = findSidebarItemByPath(activePath);

  function handleNavigate(target: string) {
    setActivePath(resolveSidebarPath(target));
  }

  return (
    <ThemeProvider>
      <main className="clinical-canvas min-h-screen">
        <SidebarShell activePath={activePath} onNavigate={handleNavigate}>
          <div className="min-h-screen">
            <Topbar onNavigate={handleNavigate} />
            <div className="mx-auto max-w-[1740px] px-4 py-5 lg:px-6 lg:py-7">
              {activePath === "/dashboard" ? (
                <DashboardPage />
              ) : (
                <EmptyState title={activeItem ? `${activeItem.label} em desenvolvimento` : "Conteúdo em desenvolvimento"} />
              )}
            </div>
          </div>
        </SidebarShell>
      </main>
    </ThemeProvider>
  );
}
