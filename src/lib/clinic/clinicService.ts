"use client";

import { readLocalCache, writeLocalCache } from "@/lib/localCache";
import {
  seedConvenios,
  seedExams,
  seedGoogleAgenda,
  seedGoogleEvents,
  seedProfessionals
} from "@/data/clinicMock";
import type { Convenio, Exam, GoogleAgendaState, GoogleEvent, Professional } from "@/data/clinicMock";

const KEYS = {
  professionals: "ebot-clinic-professionals",
  convenios: "ebot-clinic-convenios",
  exams: "ebot-clinic-exams",
  googleAgenda: "ebot-clinic-google-agenda",
  googleEvents: "ebot-clinic-google-events"
};

export function listProfessionals(): Professional[] {
  return readLocalCache<Professional[]>(KEYS.professionals, seedProfessionals);
}

export function saveProfessional(professional: Professional) {
  const rows = listProfessionals();
  const exists = rows.some((row) => row.id === professional.id);
  writeLocalCache(KEYS.professionals, exists ? rows.map((row) => (row.id === professional.id ? professional : row)) : [professional, ...rows]);
}

export function deleteProfessional(id: string) {
  writeLocalCache(KEYS.professionals, listProfessionals().filter((row) => row.id !== id));
}

export function listConvenios(): Convenio[] {
  return readLocalCache<Convenio[]>(KEYS.convenios, seedConvenios);
}

export function saveConvenio(convenio: Convenio) {
  const rows = listConvenios();
  const exists = rows.some((row) => row.id === convenio.id);
  writeLocalCache(KEYS.convenios, exists ? rows.map((row) => (row.id === convenio.id ? convenio : row)) : [convenio, ...rows]);
}

export function deleteConvenio(id: string) {
  writeLocalCache(KEYS.convenios, listConvenios().filter((row) => row.id !== id));
}

export function listExams(): Exam[] {
  return readLocalCache<Exam[]>(KEYS.exams, seedExams);
}

export function saveExam(exam: Exam) {
  const rows = listExams();
  const exists = rows.some((row) => row.id === exam.id);
  writeLocalCache(KEYS.exams, exists ? rows.map((row) => (row.id === exam.id ? exam : row)) : [exam, ...rows]);
}

export function deleteExam(id: string) {
  writeLocalCache(KEYS.exams, listExams().filter((row) => row.id !== id));
}

export function getGoogleAgenda(): GoogleAgendaState {
  return readLocalCache<GoogleAgendaState>(KEYS.googleAgenda, seedGoogleAgenda);
}

export function saveGoogleAgenda(state: GoogleAgendaState) {
  writeLocalCache(KEYS.googleAgenda, state);
}

export function listGoogleEvents(): GoogleEvent[] {
  return readLocalCache<GoogleEvent[]>(KEYS.googleEvents, seedGoogleEvents);
}

export function saveGoogleEvent(event: GoogleEvent) {
  const rows = listGoogleEvents();
  const exists = rows.some((row) => row.id === event.id);
  writeLocalCache(KEYS.googleEvents, exists ? rows.map((row) => (row.id === event.id ? event : row)) : [event, ...rows]);
}

export function deleteGoogleEvent(id: string) {
  writeLocalCache(KEYS.googleEvents, listGoogleEvents().filter((row) => row.id !== id));
}
