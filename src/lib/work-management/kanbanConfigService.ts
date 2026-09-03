"use client";

import { readLocalCache, writeLocalCache } from "@/lib/localCache";
import { kanbanColumns } from "@/data/workManagementMock";

export type KanbanStage = "Entrada" | "Ação" | "Entrega";

export type KanbanColumnConfig = {
  id: string;
  label: string;
  description: string;
  color: string;
  stage: KanbanStage;
  wip: number | null;
  active: boolean;
};

const KEY = "ebot-kanban-columns";

const defaultTone: Record<string, string> = {
  "Novo": "#3A9DCA",
  "Em atendimento": "#F2A34D",
  "Aguardando": "#9AA8A4",
  "Agendado": "#5A7873",
  "Em acompanhamento": "#4CB782",
  "Concluído": "#263532"
};

export function defaultKanbanColumns(): KanbanColumnConfig[] {
  return kanbanColumns.map((column, index) => ({
    id: column.id,
    label: column.label,
    description: column.description,
    color: defaultTone[column.id] ?? "#3A9DCA",
    stage: index === 0 ? "Entrada" : index >= kanbanColumns.length - 2 ? "Entrega" : "Ação",
    wip: null,
    active: true
  }));
}

export function listKanbanColumns(): KanbanColumnConfig[] {
  return readLocalCache<KanbanColumnConfig[]>(KEY, defaultKanbanColumns());
}

export function saveKanbanColumns(columns: KanbanColumnConfig[]) {
  writeLocalCache(KEY, columns);
}

export function resetKanbanColumns() {
  writeLocalCache(KEY, defaultKanbanColumns());
}
