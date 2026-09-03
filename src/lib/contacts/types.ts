import type { ContactChannel, ContactStage } from "@/data/contactsMock";
import type { PatientHistoryItem, PatientNextEvent, PatientStatus } from "@/data/patientsMock";

export type UnifiedContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  birthDate?: string;
  gender?: "Feminino" | "Masculino";
  channel: ContactChannel;
  stage: ContactStage;
  patientStatus?: PatientStatus;
  isPatient: boolean;
  lastActivity: string;
  tags: string[];
  photo?: string;
  origin?: string;
  responsible?: string;
  professional?: string;
  unit?: string;
  lastAppointment?: string;
  nextAppointment?: string;
  notes?: string;
  history: PatientHistoryItem[];
  nextEvents: PatientNextEvent[];
  legacyIds?: string[];
};
