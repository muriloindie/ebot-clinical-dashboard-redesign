export type ProfessionalStatus = "ativo" | "ferias" | "licenca" | "inativo";

export type Professional = {
  id: string;
  name: string;
  registro: string;
  specialty: string;
  unit: string;
  email: string;
  phone: string;
  convenioIds: string[];
  exameIds: string[];
  status: ProfessionalStatus;
  consultationsMonth: number;
  rating: number;
  avatarColor: string;
};

export type Convenio = {
  id: string;
  name: string;
  ansCode: string;
  coverage: string;
  status: "ativo" | "negociacao" | "inativo";
  professionalIds: string[];
  examIds: string[];
  sessionsMonth: number;
  updatedAt: string;
};

export type Exam = {
  id: string;
  name: string;
  category: "Imagem" | "Laboratorial" | "Cardiológico";
  preparation: string;
  duration: string;
  status: "ativo" | "inativo";
  professionalIds: string[];
  convenioIds: string[];
  sessionsMonth: number;
};

export type GoogleCalendarRef = {
  id: string;
  name: string;
  color: string;
  eventsWeek: number;
  sync: boolean;
};

export type GoogleAgendaState = {
  account: string;
  status: "conectado" | "desconectado" | "atencao";
  lastSync: string;
  autoSync: boolean;
  twoWay: boolean;
  importReminders: boolean;
  calendars: GoogleCalendarRef[];
};

export type GoogleEvent = {
  id: string;
  title: string;
  professional: string;
  unit: string;
  date: string;
  time: string;
  endTime?: string;
  dayOffset?: number;
  status: "sincronizado" | "pendente" | "conflito";
  calendarId?: string;
  contactIds?: string[];
  clientName?: string;
  description?: string;
  location?: string;
};

export const seedProfessionals: Professional[] = [
  { id: "prof-1", name: "Dr. Ricardo Lima", registro: "CRM 84521-PR", specialty: "Cardiologia", unit: "Unidade Centro", email: "ricardo@ebotclinical.com.br", phone: "+55 46 99901-1122", convenioIds: ["conv-1", "conv-2", "conv-5"], exameIds: ["exm-1", "exm-5"], status: "ativo", consultationsMonth: 142, rating: 4.9, avatarColor: "#E2574C" },
  { id: "prof-2", name: "Dra. Fernanda Rocha", registro: "CRM 79310-PR", specialty: "Clínica geral", unit: "Unidade Centro", email: "fernanda@ebotclinical.com.br", phone: "+55 46 99902-2233", convenioIds: ["conv-1", "conv-3", "conv-4"], exameIds: ["exm-2", "exm-6"], status: "ativo", consultationsMonth: 167, rating: 4.8, avatarColor: "#4CB782" },
  { id: "prof-3", name: "Dra. Camila Duarte", registro: "CRM 90117-PR", specialty: "Dermatologia", unit: "Unidade Norte", email: "camila@ebotclinical.com.br", phone: "+55 46 99903-3344", convenioIds: ["conv-2", "conv-4"], exameIds: [], status: "ativo", consultationsMonth: 118, rating: 4.9, avatarColor: "#3A9DCA" },
  { id: "prof-4", name: "Dr. Paulo Nogueira", registro: "CRM 67845-PR", specialty: "Radiologia", unit: "Unidade Centro", email: "paulo@ebotclinical.com.br", phone: "+55 46 99904-4455", convenioIds: ["conv-1", "conv-5"], exameIds: ["exm-3", "exm-4"], status: "ferias", consultationsMonth: 64, rating: 4.7, avatarColor: "#8E6FBD" },
  { id: "prof-5", name: "Dr. Pedro Iório", registro: "CRM 88290-PR", specialty: "Pediatria", unit: "Unidade Sul", email: "pedro@ebotclinical.com.br", phone: "+55 46 99905-5566", convenioIds: ["conv-1", "conv-3"], exameIds: ["exm-2"], status: "ativo", consultationsMonth: 131, rating: 5.0, avatarColor: "#F2A34D" },
  { id: "prof-6", name: "Carlos Eduardo Santos", registro: "CREFITO 33410-F", specialty: "Fisioterapia", unit: "Unidade Norte", email: "carlos.santos@ebotclinical.com.br", phone: "+55 46 99906-6677", convenioIds: ["conv-2", "conv-6"], exameIds: [], status: "ativo", consultationsMonth: 89, rating: 4.6, avatarColor: "#5A7873" },
  { id: "prof-7", name: "Bianca Torres", registro: "COREN 120988-PR", specialty: "Enfermagem", unit: "Unidade Centro", email: "bianca@ebotclinical.com.br", phone: "+55 46 99907-7788", convenioIds: [], exameIds: ["exm-2", "exm-6"], status: "licenca", consultationsMonth: 22, rating: 4.8, avatarColor: "#E2574C" },
  { id: "prof-8", name: "Dra. Helena Marques", registro: "CRN 44120-P", specialty: "Nutrição", unit: "Unidade Sul", email: "helena@ebotclinical.com.br", phone: "+55 46 99908-8899", convenioIds: ["conv-3", "conv-4", "conv-6"], exameIds: [], status: "inativo", consultationsMonth: 0, rating: 4.5, avatarColor: "#4CB782" }
];

export const seedConvenios: Convenio[] = [
  { id: "conv-1", name: "Unimed", ansCode: "ANS 339645", coverage: "Consultas, exames e internação", status: "ativo", professionalIds: ["prof-1", "prof-2", "prof-4", "prof-5"], examIds: ["exm-1", "exm-2", "exm-5", "exm-6"], sessionsMonth: 412, updatedAt: "há 3 dias" },
  { id: "conv-2", name: "Amil", ansCode: "ANS 326625", coverage: "Consultas e exames laboratoriais", status: "ativo", professionalIds: ["prof-1", "prof-3", "prof-6"], examIds: ["exm-2", "exm-6"], sessionsMonth: 287, updatedAt: "há 1 semana" },
  { id: "conv-3", name: "SulAmérica", ansCode: "ANS 006246", coverage: "Consultas, fisioterapia e imagem", status: "ativo", professionalIds: ["prof-2", "prof-5", "prof-6", "prof-8"], examIds: ["exm-2", "exm-3"], sessionsMonth: 198, updatedAt: "há 2 semanas" },
  { id: "conv-4", name: "Bradesco Saúde", ansCode: "ANS 005711", coverage: "Consultas e procedimentos ambulatoriais", status: "negociacao", professionalIds: ["prof-2", "prof-3", "prof-8"], examIds: [], sessionsMonth: 76, updatedAt: "ontem" },
  { id: "conv-5", name: "Pasteur", ansCode: "ANS 412086", coverage: "Cardiologia e diagnósticos por imagem", status: "ativo", professionalIds: ["prof-1", "prof-4"], examIds: ["exm-1", "exm-3", "exm-4", "exm-5"], sessionsMonth: 54, updatedAt: "há 1 mês" },
  { id: "conv-6", name: "Particular", ansCode: "—", coverage: "Pagamento direto por atendimento", status: "ativo", professionalIds: ["prof-6", "prof-8"], examIds: ["exm-1", "exm-2", "exm-3", "exm-4", "exm-5", "exm-6"], sessionsMonth: 165, updatedAt: "há 1 mês" }
];

export const seedExams: Exam[] = [
  { id: "exm-1", name: "Ecocardiograma", category: "Cardiológico", preparation: "Jejum de 2 horas", duration: "40 min", status: "ativo", professionalIds: ["prof-1"], convenioIds: ["conv-1", "conv-5", "conv-6"], sessionsMonth: 74 },
  { id: "exm-2", name: "Hemograma completo", category: "Laboratorial", preparation: "Jejum de 4 horas", duration: "10 min", status: "ativo", professionalIds: ["prof-2", "prof-5", "prof-7"], convenioIds: ["conv-1", "conv-2", "conv-3", "conv-6"], sessionsMonth: 320 },
  { id: "exm-3", name: "Raio-X de tórax", category: "Imagem", preparation: "Remover acessos metálicos", duration: "15 min", status: "ativo", professionalIds: ["prof-4"], convenioIds: ["conv-3", "conv-5", "conv-6"], sessionsMonth: 148 },
  { id: "exm-4", name: "Ultrassonografia abdominal", category: "Imagem", preparation: "Jejum de 8 horas", duration: "30 min", status: "ativo", professionalIds: ["prof-4"], convenioIds: ["conv-5", "conv-6"], sessionsMonth: 92 },
  { id: "exm-5", name: "Eletrocardiograma", category: "Cardiológico", preparation: "Evitar cafeína 2h antes", duration: "20 min", status: "ativo", professionalIds: ["prof-1"], convenioIds: ["conv-1", "conv-5", "conv-6"], sessionsMonth: 110 },
  { id: "exm-6", name: "Glicemia em jejum", category: "Laboratorial", preparation: "Jejum de 8 horas", duration: "5 min", status: "ativo", professionalIds: ["prof-2", "prof-7"], convenioIds: ["conv-1", "conv-2", "conv-6"], sessionsMonth: 264 }
];

export const seedGoogleAgenda: GoogleAgendaState = {
  account: "agenda@ebotclinical.com.br",
  status: "conectado",
  lastSync: "hoje, 07:42",
  autoSync: true,
  twoWay: true,
  importReminders: true,
  calendars: [
    { id: "cal-1", name: "Consultas — Unidade Centro", color: "#3A9DCA", eventsWeek: 48, sync: true },
    { id: "cal-2", name: "Exames e procedimentos", color: "#4CB782", eventsWeek: 22, sync: true },
    { id: "cal-3", name: "Equipe — reuniões internas", color: "#8E6FBD", eventsWeek: 6, sync: false }
  ]
};

export const seedGoogleEvents: GoogleEvent[] = [
  { id: "gev-1", title: "Consulta — Cardiologia", professional: "Dr. Ricardo Lima", unit: "Unidade Centro", date: "Hoje", time: "09:00", endTime: "09:40", dayOffset: 0, status: "sincronizado", calendarId: "cal-1", clientName: "Amanda Souza", description: "Primeira consulta de cardiologia.", location: "Consultório 3" },
  { id: "gev-2", title: "Ecocardiograma", professional: "Dr. Ricardo Lima", unit: "Unidade Centro", date: "Hoje", time: "10:30", endTime: "11:10", dayOffset: 0, status: "sincronizado", calendarId: "cal-2", clientName: "Carlos Eduardo Santos", description: "Ecocardiograma com laudo no mesmo dia.", location: "Sala de exames 1" },
  { id: "gev-3", title: "Consulta — Clínica geral", professional: "Dra. Fernanda Rocha", unit: "Unidade Centro", date: "Hoje", time: "14:00", endTime: "14:30", dayOffset: 0, status: "pendente", calendarId: "cal-1", clientName: "Fernanda Lima" },
  { id: "gev-4", title: "Consulta — Dermatologia", professional: "Dra. Camila Duarte", unit: "Unidade Norte", date: "Amanhã", time: "08:30", endTime: "09:00", dayOffset: 1, status: "conflito", calendarId: "cal-1", clientName: "Beatriz Ferreira" },
  { id: "gev-5", title: "Hemograma — coleta", professional: "Bianca Torres", unit: "Unidade Centro", date: "Amanhã", time: "11:00", endTime: "11:15", dayOffset: 1, status: "sincronizado", calendarId: "cal-2", clientName: "José Ricardo Alves", description: "Coleta com jejum de 4 horas." },
  { id: "gev-6", title: "Consulta — Pediatria", professional: "Dr. Pedro Iório", unit: "Unidade Sul", date: "Qui, 03 set", time: "16:00", endTime: "16:30", dayOffset: 2, status: "sincronizado", calendarId: "cal-1", clientName: "Patrícia Gomes" },
  { id: "gev-7", title: "Ultrassonografia abdominal", professional: "Dr. Paulo Nogueira", unit: "Unidade Centro", date: "Sex, 04 set", time: "07:45", endTime: "08:15", dayOffset: 3, status: "pendente", calendarId: "cal-2", clientName: "Carolina Nunes", description: "Jejum de 8 horas." }
];
