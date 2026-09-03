"use client";

import { readLocalCache, writeLocalCache } from "@/lib/localCache";

export type TagStatus = "ativa" | "arquivada";

export type Tag = {
  id: string;
  name: string;
  color: string;
  description: string;
  usage: number;
  status: TagStatus;
  showInKanban: boolean;
  updatedAt: string;
};

const CACHE_KEY = "ebot-clinical-tags";

export const seedTags: Tag[] = [
  { id: "tag-1", name: "Primeiro contato", color: "#3A9DCA", description: "Pacientes em abertura de jornada com a clínica.", usage: 2, status: "ativa", showInKanban: true, updatedAt: "hoje" },
  { id: "tag-2", name: "Exames", color: "#4CB782", description: "Solicitações, preparo e resultados de exames.", usage: 3, status: "ativa", showInKanban: true, updatedAt: "hoje" },
  { id: "tag-3", name: "Retorno", color: "#F2A34D", description: "Retornos programados após consulta ou cirurgia.", usage: 2, status: "ativa", showInKanban: true, updatedAt: "ontem" },
  { id: "tag-4", name: "Convênios", color: "#8E6FBD", description: "Dúvidas de cobertura, credenciados e autorizações.", usage: 2, status: "ativa", showInKanban: false, updatedAt: "ontem" },
  { id: "tag-5", name: "Reagendamento", color: "#E2574C", description: "Pedidos de alteração de data ou horário marcado.", usage: 1, status: "ativa", showInKanban: true, updatedAt: "há 2 dias" },
  { id: "tag-6", name: "Prioridade", color: "#E2574C", description: "Casos que precisam de encaixe ou resposta rápida.", usage: 1, status: "ativa", showInKanban: true, updatedAt: "há 2 dias" },
  { id: "tag-7", name: "Pós-consulta", color: "#4CB782", description: "Acompanhamento e satisfação depois da consulta.", usage: 1, status: "ativa", showInKanban: true, updatedAt: "há 3 dias" },
  { id: "tag-8", name: "Conteúdo", color: "#5A7873", description: "Material e respostas mapeados para a base da IA.", usage: 1, status: "ativa", showInKanban: false, updatedAt: "há 1 semana" },
  { id: "tag-9", name: "Campanha inverno", color: "#5A7873", description: "Marcador sazonal da campanha de avaliação.", usage: 52, status: "arquivada", showInKanban: false, updatedAt: "há 1 mês" }
];

function migrate(rows: Array<Tag | (Omit<Tag, "showInKanban"> & Partial<Pick<Tag, "showInKanban">>)>): Tag[] {
  return rows.map((row) => ({ ...row, showInKanban: row.showInKanban ?? row.status === "ativa" }));
}

export function listTags(): Tag[] {
  return migrate(readLocalCache<Tag[]>(CACHE_KEY, seedTags));
}

export function listKanbanTags(): Tag[] {
  return listTags().filter((tag) => tag.status === "ativa" && tag.showInKanban);
}

export function newTagId() {
  return `tag-${Date.now().toString(36)}`;
}

export function saveTag(tag: Tag) {
  const rows = listTags();
  const exists = rows.some((row) => row.id === tag.id);
  const next = exists ? rows.map((row) => (row.id === tag.id ? tag : row)) : [tag, ...rows];
  writeLocalCache(CACHE_KEY, next);
  return tag;
}

export function deleteTag(id: string) {
  writeLocalCache(CACHE_KEY, listTags().filter((row) => row.id !== id));
}
