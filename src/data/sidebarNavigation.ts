import {
  Activity,
  BookOpen,
  Bot,
  Building2,
  CalendarDays,
  CheckSquare,
  CircleHelp,
  ClipboardList,
  Code2,
  Columns3,
  ContactRound,
  FileText,
  GitBranch,
  LayoutDashboard,
  Link,
  ListOrdered,
  Megaphone,
  MessageCircle,
  MessageCircleMore,
  MessageSquareText,
  MessagesSquare,
  Plug,
  RadioTower,
  Settings,
  Settings2,
  ShieldCheck,
  Tags,
  UserRound,
  UsersRound,
  WalletCards,
  Workflow,
  Zap
} from "lucide-react";
import type { ElementType } from "react";

export type SidebarItemConfig = {
  id: string;
  label: string;
  path: string;
  icon: ElementType;
  enabled: boolean;
  description?: string;
  badge?: string;
  children?: SidebarItemConfig[];
};

export type SidebarGroupConfig = {
  id: string;
  label: string;
  icon: ElementType;
  description: string;
  defaultPath?: string;
  defaultOpen?: boolean;
  badge?: string;
  items: SidebarItemConfig[];
};

export type MenuItemId = string;

export const sidebarNavigation: SidebarGroupConfig[] = [
  {
    id: "operation",
    label: "Operação",
    icon: Activity,
    description: "Atendimentos, agenda e tarefas",
    defaultPath: "/dashboard",
    defaultOpen: true,
    items: [
      { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, enabled: true, description: "Central operacional da clínica" },
      { id: "atendimentos", label: "Atendimentos", path: "/atendimentos", icon: MessagesSquare, enabled: false },
      { id: "agenda", label: "Agenda", path: "/agenda", icon: CalendarDays, enabled: false },
      { id: "kanban", label: "Kanban", path: "/kanban", icon: Columns3, enabled: false },
      { id: "tarefas", label: "Tarefas", path: "/tarefas", icon: CheckSquare, enabled: false }
    ]
  },
  {
    id: "patients",
    label: "Pacientes",
    icon: UsersRound,
    description: "Contatos, histórico e protocolos",
    items: [
      { id: "contatos", label: "Contatos", path: "/contatos", icon: ContactRound, enabled: false },
      { id: "relacionamentos", label: "Relacionamentos", path: "/relacionamentos", icon: Link, enabled: false },
      { id: "tags", label: "Tags", path: "/tags", icon: Tags, enabled: false },
      { id: "protocolos", label: "Protocolos", path: "/protocolos", icon: ClipboardList, enabled: false },
      { id: "arquivos", label: "Arquivos", path: "/arquivos", icon: FileText, enabled: false }
    ]
  },
  {
    id: "automation",
    label: "Automação",
    icon: Bot,
    description: "IA, fluxos e base de conhecimento",
    items: [
      { id: "templates", label: "Templates", path: "/templates", icon: MessageSquareText, enabled: false },
      { id: "respostas-rapidas", label: "Respostas rápidas", path: "/respostas-rapidas", icon: Zap, enabled: false },
      { id: "open-ai", label: "Open.AI", path: "/open-ai", icon: Bot, enabled: false, description: "Configuração do assistente clínico" },
      { id: "fluxos", label: "Fluxos de atendimento", path: "/fluxos", icon: Workflow, enabled: false },
      { id: "base-conhecimento", label: "Base de conhecimento", path: "/base-conhecimento", icon: BookOpen, enabled: false }
    ]
  },
  {
    id: "communication",
    label: "Comunicação",
    icon: MessageCircle,
    description: "Canais, chat e campanhas",
    items: [
      { id: "canais", label: "Canais", path: "/canais", icon: RadioTower, enabled: false, description: "WhatsApp, webchat e APIs conectadas" },
      { id: "chat-interno", label: "Chat interno", path: "/chat-interno", icon: MessageCircleMore, enabled: false },
      { id: "campanhas", label: "Campanhas", path: "/campanhas", icon: Megaphone, enabled: false },
      { id: "listas-contatos", label: "Listas de contatos", path: "/listas-contatos", icon: UsersRound, enabled: false },
      { id: "comunicacao-configuracoes", label: "Configurações", path: "/comunicacao/configuracoes", icon: Settings, enabled: false }
    ]
  },
  {
    id: "clinic",
    label: "Clínica",
    icon: Building2,
    description: "Setores, filas e usuários",
    items: [
      { id: "setores", label: "Setores", path: "/setores", icon: GitBranch, enabled: false },
      { id: "filas", label: "Filas", path: "/filas", icon: ListOrdered, enabled: false },
      { id: "usuarios", label: "Usuários", path: "/usuarios", icon: UserRound, enabled: false },
      { id: "permissoes", label: "Permissões", path: "/permissoes", icon: ShieldCheck, enabled: false }
    ]
  },
  {
    id: "system",
    label: "Sistema",
    icon: Settings2,
    description: "Integrações, API e financeiro",
    items: [
      { id: "integracoes", label: "Integrações", path: "/integracoes", icon: Plug, enabled: false },
      { id: "api", label: "API", path: "/api", icon: Code2, enabled: false },
      { id: "financeiro", label: "Financeiro", path: "/financeiro", icon: WalletCards, enabled: false },
      { id: "configuracoes", label: "Configurações", path: "/configuracoes", icon: Settings, enabled: false },
      { id: "ajuda", label: "Ajuda", path: "/ajuda", icon: CircleHelp, enabled: false }
    ]
  }
];

export function getSidebarGroupDefaultPath(group: SidebarGroupConfig) {
  return group.defaultPath ?? group.items[0]?.path ?? "/dashboard";
}

export function getSidebarItemId(item: SidebarItemConfig) {
  return item.id;
}

export function getAllSidebarItems() {
  return sidebarNavigation.flatMap((group) => group.items.flatMap((item) => (item.children?.length ? [item, ...item.children] : [item])));
}

export function findSidebarItemByPath(path: string) {
  return getAllSidebarItems().find((item) => item.path === path);
}

export function findSidebarGroupByPath(path: string) {
  return sidebarNavigation.find((group) =>
    group.items.some((item) => item.path === path || item.children?.some((child) => child.path === path))
  );
}

export function findSidebarItemById(itemId: string) {
  return getAllSidebarItems().find((item) => item.id === itemId);
}

export function findSidebarGroupByItem(itemId: string) {
  return sidebarNavigation.find((group) =>
    group.items.some((item) => item.id === itemId || item.children?.some((child) => child.id === itemId))
  );
}

export function resolveSidebarPath(target: string) {
  if (target.startsWith("/")) return findSidebarItemByPath(target)?.path ?? target;
  return findSidebarItemById(target)?.path ?? "/dashboard";
}
