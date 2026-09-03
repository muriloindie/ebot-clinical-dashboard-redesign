export type ProtocolCategory = "Primeiro contato" | "Agendamento" | "Pós-consulta" | "Exames" | "Reagendamento";
export type ProtocolStatus = "Em andamento" | "Concluído" | "Aguardando" | "Cancelado";
export type ProtocolMessageDirection = "incoming" | "outgoing" | "system";
export type ProtocolMessageKind = "text" | "image" | "document" | "audio";
export type ProtocolSenderKind = "client" | "attendant" | "robot" | "system";

export type ProtocolMessage = {
  id: string;
  direction: ProtocolMessageDirection;
  kind: ProtocolMessageKind;
  sender: string;
  senderKind: ProtocolSenderKind;
  attendant?: string;
  sentAt: string;
  text: string;
  attachmentName?: string;
  device?: string;
  read?: boolean;
  listened?: boolean;
  durationSeconds?: number;
};

export type ProtocolRecord = {
  id: string;
  number: string;
  title: string;
  category: ProtocolCategory;
  status: ProtocolStatus;
  patientName: string;
  patientId: string;
  phone: string;
  user: string;
  sector: string;
  queue: string;
  responsible: string;
  channel: string;
  date: string;
  startedAt: string;
  firstMessageAt: string;
  attendedAt: string;
  updatedAt: string;
  duration: string;
  summary: string;
  messages: ProtocolMessage[];
};

export const protocolCategories: ProtocolCategory[] = ["Primeiro contato", "Agendamento", "Pós-consulta", "Exames", "Reagendamento"];

export const protocolStatuses: ProtocolStatus[] = ["Em andamento", "Concluído", "Aguardando", "Cancelado"];

export const protocols: ProtocolRecord[] = [
  {
    id: "PR-2026-0112",
    number: "#46-20260812083959",
    title: "Primeiro contato",
    category: "Primeiro contato",
    status: "Em andamento",
    patientName: "Amanda Souza",
    patientId: "PAC-0171",
    phone: "+55 11 99674-2208",
    user: "Marina Costa",
    sector: "Recepção",
    queue: "Primeira consulta",
    responsible: "Marina Costa",
    channel: "WhatsApp",
    date: "12/08/2026",
    startedAt: "Hoje, 08:58",
    firstMessageAt: "Hoje, 08:58",
    attendedAt: "Hoje, 08:59",
    updatedAt: "Hoje, 09:05",
    duration: "7 min",
    summary: "Pré-agendamento de primeira consulta com validação de unidade e horário.",
    messages: [
      { id: "m-0112-1", direction: "incoming", kind: "text", sender: "Amanda Souza", senderKind: "client", sentAt: "08:58", text: "Olá, gostaria de marcar uma consulta com a Dra. Fernanda.", device: "Android · WhatsApp", read: true },
      { id: "m-0112-2", direction: "outgoing", kind: "text", sender: "Ê-Bot", senderKind: "robot", sentAt: "08:59", text: "Bom dia, Amanda. Posso ajudar. Você prefere a Unidade Centro ou a Unidade Norte?", device: "Ê-Bot · API", read: true },
      { id: "m-0112-3", direction: "incoming", kind: "text", sender: "Amanda Souza", senderKind: "client", sentAt: "09:01", text: "Pode ser na Unidade Centro, no período da tarde.", device: "Android · WhatsApp", read: true },
      { id: "m-0112-4", direction: "system", kind: "text", sender: "Sistema", senderKind: "system", sentAt: "09:05", text: "Pré-agendamento criado para hoje às 16:00. Aguardando confirmação da recepção." }
    ]
  },
  {
    id: "PR-2026-0110",
    number: "#45-20260812081204",
    title: "Resultado de ecocardiograma",
    category: "Exames",
    status: "Aguardando",
    patientName: "Carlos Eduardo Santos",
    patientId: "PAC-0176",
    phone: "+55 11 98812-4410",
    user: "Dr. Ricardo Lima",
    sector: "Cardiologia",
    queue: "Resultados de exames",
    responsible: "Dr. Ricardo Lima",
    channel: "WhatsApp",
    date: "12/08/2026",
    startedAt: "Hoje, 09:50",
    firstMessageAt: "Hoje, 09:50",
    attendedAt: "Hoje, 09:52",
    updatedAt: "Hoje, 10:04",
    duration: "14 min",
    summary: "Resultado liberado e encaminhado para avaliação do profissional responsável.",
    messages: [
      { id: "m-0110-1", direction: "outgoing", kind: "text", sender: "Recepção", senderKind: "attendant", attendant: "Julia Alves", sentAt: "09:50", text: "Olá, Carlos. Seu resultado de ecocardiograma já está disponível para avaliação.", device: "Web · Painel", read: true },
      { id: "m-0110-2", direction: "incoming", kind: "audio", sender: "Carlos Eduardo Santos", senderKind: "client", sentAt: "09:53", text: "Áudio do paciente.", device: "iPhone · WhatsApp", listened: false, durationSeconds: 24 },
      { id: "m-0110-3", direction: "outgoing", kind: "document", sender: "Recepção", senderKind: "attendant", attendant: "Julia Alves", sentAt: "10:04", text: "Laudo encaminhado para o atendimento do profissional.", attachmentName: "laudo-ecocardiograma.pdf", device: "Web · Painel", read: false }
    ]
  },
  {
    id: "PR-2026-0108",
    number: "#44-20260812080517",
    title: "Confirmação de consulta",
    category: "Agendamento",
    status: "Concluído",
    patientName: "Fernanda Lima",
    patientId: "PAC-0158",
    phone: "+55 11 99320-7781",
    user: "Ê-Bot",
    sector: "Dermatologia",
    queue: "Confirmação de consultas",
    responsible: "IA + equipe",
    channel: "Instagram",
    date: "12/08/2026",
    startedAt: "Hoje, 09:38",
    firstMessageAt: "Hoje, 09:38",
    attendedAt: "Hoje, 09:38",
    updatedAt: "Hoje, 09:44",
    duration: "6 min",
    summary: "Consulta de retorno confirmada após conversa iniciada no Instagram.",
    messages: [
      { id: "m-0108-1", direction: "outgoing", kind: "text", sender: "Ê-Bot", senderKind: "robot", sentAt: "09:38", text: "Olá, Fernanda. Podemos confirmar seu retorno de dermatologia hoje às 15:00?", device: "Ê-Bot · API", read: true },
      { id: "m-0108-2", direction: "incoming", kind: "text", sender: "Fernanda Lima", senderKind: "client", sentAt: "09:43", text: "Sim, está confirmado.", device: "Android · Instagram", read: true },
      { id: "m-0108-3", direction: "system", kind: "text", sender: "Sistema", senderKind: "system", sentAt: "09:44", text: "Consulta confirmada e status atualizado na agenda." }
    ]
  },
  {
    id: "PR-2026-0103",
    number: "#43-20260811080733",
    title: "Acompanhamento pós-consulta",
    category: "Pós-consulta",
    status: "Concluído",
    patientName: "Beatriz Ferreira",
    patientId: "PAC-0163",
    phone: "+55 11 98455-6619",
    user: "Marina Costa",
    sector: "Pediatria",
    queue: "Pós-consulta",
    responsible: "Marina Costa",
    channel: "WhatsApp",
    date: "11/08/2026",
    startedAt: "Ontem, 08:20",
    firstMessageAt: "Ontem, 08:20",
    attendedAt: "Ontem, 08:34",
    updatedAt: "Ontem, 08:42",
    duration: "22 min",
    summary: "Acompanhamento de atraso com priorização de encaixe pela recepção.",
    messages: [
      { id: "m-0103-1", direction: "incoming", kind: "text", sender: "Beatriz Ferreira", senderKind: "client", sentAt: "08:20", text: "Estou aguardando há bastante tempo. Existe previsão para o atendimento?", device: "Android · WhatsApp", read: true },
      { id: "m-0103-2", direction: "outgoing", kind: "image", sender: "Recepção", senderKind: "attendant", attendant: "Marina Costa", sentAt: "08:34", text: "Foto da nova sala de espera enviada.", attachmentName: "sala-espera.jpg", device: "Web · Painel", read: true },
      { id: "m-0103-3", direction: "system", kind: "text", sender: "Sistema", senderKind: "system", sentAt: "08:42", text: "Encaixe priorizado e paciente notificada." }
    ]
  },
  {
    id: "PR-2026-0098",
    number: "#42-20260812080402",
    title: "Entrega de resultado",
    category: "Exames",
    status: "Concluído",
    patientName: "Carolina Nunes",
    patientId: "PAC-0134",
    phone: "+55 11 99731-1802",
    user: "Julia Alves",
    sector: "Dermatologia",
    queue: "Resultados de exames",
    responsible: "Julia Alves",
    channel: "E-mail",
    date: "12/08/2026",
    startedAt: "Hoje, 08:48",
    firstMessageAt: "Hoje, 08:48",
    attendedAt: "Hoje, 08:48",
    updatedAt: "Hoje, 08:55",
    duration: "7 min",
    summary: "Resultado de biópsia disponibilizado no portal e comunicado ao contato.",
    messages: [
      { id: "m-0098-1", direction: "outgoing", kind: "text", sender: "Recepção", senderKind: "attendant", attendant: "Julia Alves", sentAt: "08:48", text: "Carolina, seu resultado já está disponível no portal do paciente.", device: "Web · Painel", read: true },
      { id: "m-0098-2", direction: "incoming", kind: "text", sender: "Carolina Nunes", senderKind: "client", sentAt: "08:55", text: "Recebi a mensagem. Obrigada pelo aviso.", device: "Web · E-mail", read: true }
    ]
  },
  {
    id: "PR-2026-0094",
    number: "#41-20260812075948",
    title: "Reagendamento de retorno",
    category: "Reagendamento",
    status: "Em andamento",
    patientName: "José Ricardo Alves",
    patientId: "PAC-0119",
    phone: "+55 11 98577-0934",
    user: "Julia Alves",
    sector: "Ortopedia",
    queue: "Reagendamentos",
    responsible: "Julia Alves",
    channel: "Telefone",
    date: "12/08/2026",
    startedAt: "Hoje, 09:18",
    firstMessageAt: "Hoje, 09:18",
    attendedAt: "Hoje, 09:22",
    updatedAt: "Hoje, 09:22",
    duration: "4 min",
    summary: "Paciente solicitou nova data por atraso na liberação do exame.",
    messages: [
      { id: "m-0094-1", direction: "incoming", kind: "text", sender: "José Ricardo Alves", senderKind: "client", sentAt: "09:18", text: "Preciso trocar a data do retorno porque meu exame ainda não ficou pronto.", device: "Telefone · Ligação", read: true },
      { id: "m-0094-2", direction: "outgoing", kind: "text", sender: "Recepção", senderKind: "attendant", attendant: "Julia Alves", sentAt: "09:22", text: "Vou verificar as próximas disponibilidades do Dr. André e retorno com as opções.", device: "Web · Painel", read: false }
    ]
  },
  {
    id: "PR-2026-0086",
    number: "#40-20260807090114",
    title: "Orientação de preparo",
    category: "Exames",
    status: "Cancelado",
    patientName: "Patrícia Gomes",
    patientId: "PAC-0112",
    phone: "+55 11 98214-3356",
    user: "Ê-Bot",
    sector: "Recepção",
    queue: "Preparo de exames",
    responsible: "IA + equipe",
    channel: "E-mail",
    date: "07/08/2026",
    startedAt: "07 ago 2026, 09:10",
    firstMessageAt: "07 ago 2026, 09:10",
    attendedAt: "07 ago 2026, 09:10",
    updatedAt: "07 ago 2026, 09:14",
    duration: "4 min",
    summary: "Orientação interrompida após o contato solicitar atendimento por telefone.",
    messages: [
      { id: "m-0086-1", direction: "incoming", kind: "text", sender: "Patrícia Gomes", senderKind: "client", sentAt: "09:10", text: "Gostaria de confirmar o preparo para o exame de amanhã.", device: "Web · E-mail", read: true },
      { id: "m-0086-2", direction: "system", kind: "text", sender: "Sistema", senderKind: "system", sentAt: "09:14", text: "Atendimento encerrado a pedido do contato. Novo contato por telefone necessário." }
    ]
  }
];
