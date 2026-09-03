export type SystemUser = {
  id: string;
  name: string;
  email: string;
  profile: "Administrador" | "Gestor" | "Suporte" | "Observador";
  sector: string;
  status: "ativo" | "bloqueado" | "convite";
  lastAccess: string;
  twoFactor: boolean;
  createdAt: string;
  avatarColor: string;
};

export type SystemLog = {
  id: string;
  timestamp: string;
  level: "info" | "aviso" | "erro";
  module: string;
  user: string;
  message: string;
};

export type BugReport = {
  id: string;
  title: string;
  description: string;
  screen: string;
  severity: "crítico" | "alto" | "médio" | "baixo";
  status: "aberto" | "em análise" | "resolvido";
  reportedBy: string;
  reportedAt: string;
};

export type AppearanceSettings = {
  logoText: string;
  sidebarStyle: "claro" | "escuro";
  accent: "Azul clínico" | "Verde clínico" | "Violeta" | "Laranja";
  density: "Confortável" | "Compacta";
  roundedCorners: boolean;
  animations: boolean;
  showBadges: boolean;
};

export const seedSystemUsers: SystemUser[] = [
  { id: "sys-1", name: "Dr. Ruan Viana", email: "ruan@ebotclinical.com.br", profile: "Administrador", sector: "Direção", status: "ativo", lastAccess: "agora", twoFactor: true, createdAt: "02 jan 2024", avatarColor: "#3A9DCA" },
  { id: "sys-2", name: "Marina Costa", email: "marina@ebotclinical.com.br", profile: "Gestor", sector: "Atendimento", status: "ativo", lastAccess: "há 12 min", twoFactor: true, createdAt: "02 jan 2025", avatarColor: "#4CB782" },
  { id: "sys-3", name: "Carla Mendes", email: "carla@ebotclinical.com.br", profile: "Gestor", sector: "Financeiro", status: "ativo", lastAccess: "há 1 hora", twoFactor: false, createdAt: "12 jun 2025", avatarColor: "#E2574C" },
  { id: "sys-4", name: "Julia Alves", email: "julia@ebotclinical.com.br", profile: "Gestor", sector: "Comunicação", status: "ativo", lastAccess: "há 5 min", twoFactor: true, createdAt: "22 set 2025", avatarColor: "#F2A34D" },
  { id: "sys-5", name: "Suporte Ê-Bot", email: "suporte@ebot.io", profile: "Suporte", sector: "Externo", status: "ativo", lastAccess: "ontem, 17:20", twoFactor: true, createdAt: "01 fev 2024", avatarColor: "#8E6FBD" },
  { id: "sys-6", name: "Auditoria Externa", email: "auditoria@parceiro.com.br", profile: "Observador", sector: "Externo", status: "bloqueado", lastAccess: "há 2 meses", twoFactor: false, createdAt: "15 ago 2025", avatarColor: "#5A7873" },
  { id: "sys-7", name: "Tiago Barros", email: "tiago@ebotclinical.com.br", profile: "Gestor", sector: "Exames", status: "convite", lastAccess: "—", twoFactor: false, createdAt: "há 2 dias", avatarColor: "#3A9DCA" }
];

export const seedSystemLogs: SystemLog[] = [
  { id: "log-1", timestamp: "Hoje, 09:41:12", level: "info", module: "Atendimentos", user: "IA Ê-Bot", message: "Atendimento AT-1101 assumido automaticamente pela IA (confirmação de consulta)." },
  { id: "log-2", timestamp: "Hoje, 09:38:44", level: "aviso", module: "Integrações", user: "Sistema", message: "Latência elevada no webhook do laboratório (1.8s acima da média)." },
  { id: "log-3", timestamp: "Hoje, 09:21:03", level: "info", module: "Campanhas", user: "Marina Costa", message: "Campanha 'Lembrete de retorno pós-consulta' alcançou 612 de 842 envios." },
  { id: "log-4", timestamp: "Hoje, 08:57:19", level: "erro", module: "Canais", user: "Sistema", message: "Falha temporária na conexão do canal WhatsApp da Unidade Norte; reconexão automática em 12s." },
  { id: "log-5", timestamp: "Hoje, 08:40:55", level: "info", module: "Configurações", user: "Dr. Ruan Viana", message: "Janela de envio de campanhas alterada para 08:00 – 20:00." },
  { id: "log-6", timestamp: "Hoje, 08:12:37", level: "aviso", module: "Financeiro", user: "Sistema", message: "Fatura de setembro vence em 3 dias (R$ 890,00)." },
  { id: "log-7", timestamp: "Ontem, 18:44:02", level: "info", module: "Usuários", user: "Dr. Ruan Viana", message: "Convite de acesso enviado para tiago@ebotclinical.com.br (perfil Gestor)." },
  { id: "log-8", timestamp: "Ontem, 17:30:10", level: "erro", module: "Agenda", user: "IA Ê-Bot", message: "Conflito de horário detectado na agenda do Dr. Paulo Nogueira (Google Agenda)." },
  { id: "log-9", timestamp: "Ontem, 16:05:48", level: "info", module: "Automação", user: "Julia Alves", message: "Fluxo 'Triagem de exames' ativado após validação clínica." },
  { id: "log-10", timestamp: "Ontem, 14:52:31", level: "aviso", module: "Atendimentos", user: "Sistema", message: "Fila de exames acima do SLA: tempo médio de espera de 12 min (limite 10 min)." },
  { id: "log-11", timestamp: "Ontem, 11:18:09", level: "info", module: "Pacientes", user: "Marina Costa", message: "Importação de 24 contatos concluída com consentimento LGPD verificado." },
  { id: "log-12", timestamp: "02 set, 10:07:44", level: "info", module: "Sistema", user: "Sistema", message: "Backup automático diário concluído (2.4 GB, integridade verificada)." }
];

export const seedBugReports: BugReport[] = [
  { id: "bug-1", title: "QR Code expira sem aviso na tela Canais", description: "Ao reconectar o canal WhatsApp, o QR Code expira em 20s sem aviso visual e o card continua como 'conectando'.", screen: "Canais", severity: "alto", status: "em análise", reportedBy: "Marina Costa", reportedAt: "hoje, 08:35" },
  { id: "bug-2", title: "Duplicidade de agendamento com sync Google", description: "Ao arrastar consulta na agenda interna com two-way ativo, o evento é duplicado no Google Agenda em ~30% dos casos.", screen: "Agenda / Agenda Google", severity: "crítico", status: "aberto", reportedBy: "Dra. Fernanda Rocha", reportedAt: "ontem, 16:12" },
  { id: "bug-3", title: "Modal de edição de fila perde cor selecionada", description: "Ao escolher a cor da fila e trocar de aba dentro do modal, a seleção volta para o valor anterior ao salvar.", screen: "Filas", severity: "médio", status: "em análise", reportedBy: "Julia Alves", reportedAt: "ontem, 11:40" },
  { id: "bug-4", title: "Notificação de nova fatura fora do horário", description: "O alerta de fatura vencida chega às 03:00 para usuários com digest diário, ignorando a janela configurada.", screen: "Financeiro / Configurações", severity: "baixo", status: "aberto", reportedBy: "Carla Mendes", reportedAt: "02 set, 08:05" },
  { id: "bug-5", title: "Anexo PDF não abre no drawer do arquivo", description: "PDFs acima de 8 MB não carregam a pré-visualização no drawer; apenas download funciona.", screen: "Arquivos", severity: "médio", status: "resolvido", reportedBy: "Bianca Torres", reportedAt: "29 ago, 14:22" },
  { id: "bug-6", title: "Contador de não lidos não zera", description: "Após responder todas as mensagens de um atendimento, o badge da fila continua marcado como não lido.", screen: "Atendimentos", severity: "alto", status: "resolvido", reportedBy: "Marina Costa", reportedAt: "28 ago, 09:58" }
];

export const seedAppearance: AppearanceSettings = {
  logoText: "Ê-Bot Clinical",
  sidebarStyle: "claro",
  accent: "Azul clínico",
  density: "Confortável",
  roundedCorners: true,
  animations: true,
  showBadges: true
};
