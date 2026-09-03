"use client";

import { contacts, type Contact, type ContactChannel } from "@/data/contactsMock";
import { patients, type Patient } from "@/data/patientsMock";
import { readLocalCache, writeLocalCache } from "@/lib/localCache";
import type { UnifiedContact } from "./types";

export const CONTACTS_CACHE_KEY = "ebot-contacts";
const LEGACY_CONTACTS_CACHE_KEY = "ebot-week2-contacts";
const LEGACY_PATIENTS_CACHE_KEY = "ebot-week2-patients";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function identityValues(record: Pick<UnifiedContact, "phone" | "email">) {
  return [normalizePhone(record.phone), normalizeEmail(record.email)].filter(Boolean);
}

function inferChannel(tags: string[]): ContactChannel {
  if (tags.includes("Instagram")) return "Instagram";
  if (tags.includes("E-mail")) return "E-mail";
  if (tags.includes("Telefone")) return "Telefone";
  if (tags.includes("Site")) return "Site";
  return "WhatsApp";
}

function patientStage(status: Patient["status"]): UnifiedContact["stage"] {
  if (status === "Ativo") return "Convertido";
  if (status === "Inativo") return "Inativo";
  return "Novo contato";
}

function contactToUnified(contact: Contact): UnifiedContact {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.whatsapp,
    email: contact.email,
    channel: contact.channel,
    stage: contact.stage,
    isPatient: contact.tags.includes("Paciente") || contact.stage === "Convertido",
    lastActivity: contact.lastSeen,
    tags: [...contact.tags],
    photo: contact.photo,
    origin: contact.origin,
    responsible: contact.responsible,
    history: [],
    nextEvents: []
  };
}

function patientToUnified(patient: Patient): UnifiedContact {
  const latestInteraction = patient.history.find((item) => item.type === "Atendimento" || item.type === "Interação com IA");
  return {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    cpf: patient.cpf,
    birthDate: patient.birthDate,
    gender: patient.gender,
    channel: inferChannel(patient.tags),
    stage: patientStage(patient.status),
    patientStatus: patient.status,
    isPatient: true,
    lastActivity: latestInteraction?.date ?? patient.history[0]?.date ?? patient.lastAppointment ?? "—",
    tags: [...patient.tags],
    responsible: patient.professional,
    professional: patient.professional,
    unit: patient.unit,
    lastAppointment: patient.lastAppointment,
    nextAppointment: patient.nextAppointment,
    notes: patient.notes,
    history: [...patient.history],
    nextEvents: [...patient.nextEvents],
    legacyIds: [patient.id]
  };
}

function mergePatient(current: UnifiedContact, patient: Patient): UnifiedContact {
  const patientRecord = patientToUnified(patient);
  return {
    ...current,
    name: patientRecord.name || current.name,
    phone: patientRecord.phone || current.phone,
    email: patientRecord.email || current.email,
    cpf: patientRecord.cpf,
    birthDate: patientRecord.birthDate,
    gender: patientRecord.gender,
    stage: patientRecord.stage,
    patientStatus: patientRecord.patientStatus,
    isPatient: true,
    lastActivity: current.lastActivity || patientRecord.lastActivity,
    tags: Array.from(new Set([...current.tags, ...patientRecord.tags])),
    responsible: current.responsible ?? patientRecord.responsible,
    professional: patientRecord.professional,
    unit: patientRecord.unit,
    lastAppointment: patientRecord.lastAppointment,
    nextAppointment: patientRecord.nextAppointment,
    notes: patientRecord.notes ?? current.notes,
    history: patientRecord.history.length ? patientRecord.history : current.history,
    nextEvents: patientRecord.nextEvents,
    legacyIds: Array.from(new Set([...(current.legacyIds ?? []), patient.id]))
  };
}

function mergeLegacyData(legacyContacts: Contact[], legacyPatients: Patient[]) {
  const merged = legacyContacts.map(contactToUnified);

  for (const patient of legacyPatients) {
    const patientIdentity = identityValues({ phone: patient.phone, email: patient.email });
    const matchIndex = merged.findIndex((contact) => identityValues(contact).some((value) => patientIdentity.includes(value)));
    if (matchIndex === -1) {
      merged.push(patientToUnified(patient));
    } else {
      merged[matchIndex] = mergePatient(merged[matchIndex], patient);
    }
  }

  return merged;
}

function readCanonicalContacts() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONTACTS_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as UnifiedContact[] : null;
  } catch {
    return null;
  }
}

export function listContacts() {
  const canonical = readCanonicalContacts();
  if (canonical) return canonical;

  const legacyContacts = readLocalCache<Contact[]>(LEGACY_CONTACTS_CACHE_KEY, contacts);
  const legacyPatients = readLocalCache<Patient[]>(LEGACY_PATIENTS_CACHE_KEY, patients);
  const migrated = mergeLegacyData(legacyContacts, legacyPatients);
  writeLocalCache(CONTACTS_CACHE_KEY, migrated);
  return migrated;
}

export function saveContacts(rows: UnifiedContact[]) {
  writeLocalCache(CONTACTS_CACHE_KEY, rows);
}

export function clearContactCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONTACTS_CACHE_KEY);
  window.localStorage.removeItem(LEGACY_CONTACTS_CACHE_KEY);
  window.localStorage.removeItem(LEGACY_PATIENTS_CACHE_KEY);
}
