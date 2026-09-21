"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Link2,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Unlink,
  UserRound,
  X
} from "lucide-react";
import type { GoogleAgendaState, GoogleCalendarRef, GoogleEvent } from "@/data/clinicMock";
import { deleteGoogleEvent, getGoogleAgenda, listGoogleEvents, saveGoogleAgenda, saveGoogleEvent } from "@/lib/clinic/clinicService";
import { listContacts } from "@/lib/contacts/contactsService";
import { useDemo } from "@/components/state/DemoProvider";
import { usePageEnter } from "@/lib/usePageEnter";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ColorField } from "@/components/ui/ColorField";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Modal } from "@/components/ui/Modal";
import { ModalField, ModalSelect, ModalTextarea } from "@/components/ui/ModalField";
import { StatusBadge, PageHeader } from "@/components/ui/Week1Primitives";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/cn";

type CalendarView = "mes" | "semana" | "dia";

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function eventDate(event: GoogleEvent, today: Date): Date {
  return addDays(startOfDay(today), event.dayOffset ?? 0);
}

function toIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromIso(iso: string, today: Date): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = startOfDay(new Date(y, m - 1, d));
  return Math.round((target.getTime() - startOfDay(today).getTime()) / 86400000);
}

function prettyDate(date: Date, today: Date): string {
  const diff = Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return `${WEEKDAYS[date.getDay()].toLowerCase()}, ${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

const eventStatus: Record<GoogleEvent["status"], { label: string; tone: "green" | "orange" | "red" }> = {
  sincronizado: { label: "Sincronizado", tone: "green" },
  pendente: { label: "Pendente", tone: "orange" },
  conflito: { label: "Conflito", tone: "red" }
};

type EventDraft = {
  id: string;
  title: string;
  calendarId: string;
  dateIso: string;
  time: string;
  endTime: string;
  professional: string;
  unit: string;
  contactIds: string[];
  clientName: string;
  description: string;
  location: string;
};

function toEventDraft(event: GoogleEvent | null, today: Date, fallbackCalendar: string): EventDraft {
  if (!event) {
    return { id: "", title: "", calendarId: fallbackCalendar, dateIso: toIso(today), time: "09:00", endTime: "09:30", professional: "", unit: "Unidade Centro", contactIds: [], clientName: "", description: "", location: "" };
  }
  return {
    id: event.id,
    title: event.title,
    calendarId: event.calendarId ?? fallbackCalendar,
    dateIso: toIso(eventDate(event, today)),
    time: event.time,
    endTime: event.endTime ?? event.time,
    professional: event.professional,
    unit: event.unit,
    contactIds: event.contactIds ?? [],
    clientName: event.clientName ?? "",
    description: event.description ?? "",
    location: event.location ?? ""
  };
}

export function AgendaGooglePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { toast } = useDemo();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [agenda, setAgenda] = useState<GoogleAgendaState | null>(null);
  const [events, setEvents] = useState<GoogleEvent[]>(() => listGoogleEvents());
  const [view, setView] = useState<CalendarView>("semana");
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [account, setAccount] = useState("");
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null);
  const [eventEditing, setEventEditing] = useState<GoogleEvent | null>(null);
  const [contactQuery, setContactQuery] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDraft, setCalendarDraft] = useState<GoogleCalendarRef | null>(null);
  const [calendarEditing, setCalendarEditing] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<GoogleEvent | null>(null);

  const contacts = useMemo(() => listContacts(), []);
  const professionals = useMemo(() => Array.from(new Set([...events.map((event) => event.professional), "Dr. Ricardo Lima", "Dra. Fernanda Rocha", "Dra. Camila Duarte", "Bianca Torres", "Dr. Pedro Iório", "Dr. Paulo Nogueira"].filter(Boolean))), [events]);

  usePageEnter(pageRef, [{ selector: "[data-agenda-panel]", from: { opacity: 0, y: 18 } }], { stagger: 0.07, delay: 0.05 });

  useEffect(() => {
    const state = getGoogleAgenda();
    setAgenda(state);
    setAccount(state.account);
    setSelectedIds(state.calendars.filter((calendar) => calendar.sync).map((calendar) => calendar.id));
    setEvents(listGoogleEvents());
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function persistAgenda(next: GoogleAgendaState) {
    setAgenda(next);
    saveGoogleAgenda(next);
  }

  function toggleCalendar(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function visibleEvents() {
    return events.filter((event) => !event.calendarId || selectedIds.includes(event.calendarId));
  }

  function calendarColor(id?: string) {
    return agenda?.calendars.find((calendar) => calendar.id === id)?.color ?? "#3A9DCA";
  }

  function calendarName(id?: string) {
    return agenda?.calendars.find((calendar) => calendar.id === id)?.name ?? "Agenda";
  }

  // ---- conexão ----
  function connect() {
    if (!agenda) return;
    const next = { ...agenda, account: account.trim() || agenda.account, status: "conectado" as const, lastSync: "agora" };
    persistAgenda(next);
    setAccountModal(false);
    showNotice(`Google Agenda conectado para ${next.account} (demo local).`);
  }

  function disconnect() {
    if (!agenda) return;
    persistAgenda({ ...agenda, status: "desconectado" as const, lastSync: "—" });
    setDisconnectOpen(false);
    showNotice("Google Agenda desconectado da clínica.");
  }

  function verifyConnection() {
    if (!agenda) return;
    if (agenda.status !== "conectado") {
      toast("Conecte a conta do Google antes de verificar.", "warning");
      return;
    }
    persistAgenda({ ...agenda, lastSync: "agora" });
    setEvents(listGoogleEvents());
    setConnectionOpen(false);
    showNotice(`Conexão verificada: ${agenda.account} · ${agenda.calendars.length} agendas · ${events.length} eventos.`);
  }

  // ---- agendas ----
  function openNewCalendar() {
    setCalendarEditing(false);
    setCalendarDraft({ id: "", name: "", color: "#3A9DCA", eventsWeek: 0, sync: true });
    setCalendarOpen(true);
  }

  function openEditCalendar(calendar: GoogleCalendarRef) {
    setCalendarEditing(true);
    setCalendarDraft({ ...calendar });
    setCalendarOpen(true);
  }

  function saveCalendar() {
    if (!agenda || !calendarDraft) return;
    if (!calendarDraft.name.trim()) {
      toast("Informe o nome da agenda.", "warning");
      return;
    }
    const next: GoogleCalendarRef = {
      id: calendarDraft.id || `cal-${Date.now().toString(36)}`,
      name: calendarDraft.name.trim(),
      color: calendarDraft.color,
      eventsWeek: calendarDraft.eventsWeek,
      sync: calendarDraft.sync
    };
    const exists = agenda.calendars.some((calendar) => calendar.id === next.id);
    persistAgenda({ ...agenda, calendars: exists ? agenda.calendars.map((calendar) => (calendar.id === next.id ? next : calendar)) : [...agenda.calendars, next] });
    if (!exists) setSelectedIds((current) => [...current, next.id]);
    setCalendarOpen(false);
    showNotice(exists ? `Agenda "${next.name}" atualizada.` : `Agenda "${next.name}" criada.`);
  }

  // ---- eventos ----
  function openNewEvent(day?: Date) {
    if (!agenda) return;
    setEventEditing(null);
    const draft = toEventDraft(null, today, agenda.calendars[0]?.id ?? "");
    if (day) draft.dateIso = toIso(day);
    setEventDraft(draft);
    setContactQuery("");
    setEventOpen(true);
  }

  function openEditEvent(event: GoogleEvent) {
    if (!agenda) return;
    setEventEditing(event);
    setEventDraft(toEventDraft(event, today, agenda.calendars[0]?.id ?? ""));
    setContactQuery("");
    setEventOpen(true);
  }

  function saveEvent() {
    if (!eventDraft) return;
    if (!eventDraft.title.trim()) {
      toast("Informe o título do evento.", "warning");
      return;
    }
    if (!eventDraft.calendarId) {
      toast("Selecione a agenda do evento.", "warning");
      return;
    }
    const date = eventDate({ ...({} as GoogleEvent), dayOffset: fromIso(eventDraft.dateIso, today) }, today);
    const base = eventEditing ?? events.find((row) => row.id === eventDraft.id);
    const next: GoogleEvent = {
      id: eventEditing?.id ?? `gev-${Date.now().toString(36)}`,
      title: eventDraft.title.trim(),
      professional: eventDraft.professional.trim() || "A definir",
      unit: eventDraft.unit,
      date: prettyDate(date, today),
      time: eventDraft.time,
      endTime: eventDraft.endTime,
      dayOffset: fromIso(eventDraft.dateIso, today),
      status: base?.status ?? "pendente",
      calendarId: eventDraft.calendarId,
      contactIds: eventDraft.contactIds,
      clientName: eventDraft.clientName.trim(),
      description: eventDraft.description.trim(),
      location: eventDraft.location.trim()
    };
    saveGoogleEvent(next);
    setEvents(listGoogleEvents());
    setEventOpen(false);
    setEventEditing(null);
    showNotice(eventEditing ? `Evento "${next.title}" atualizado.` : `Evento "${next.title}" criado em ${next.date}.`);
  }

  function removeEvent() {
    if (!eventToDelete) return;
    deleteGoogleEvent(eventToDelete.id);
    setEvents(listGoogleEvents());
    setEventToDelete(null);
    showNotice(`Evento "${eventToDelete.title}" removido.`);
  }

  function toggleDraftContact(id: string) {
    if (!eventDraft) return;
    setEventDraft({ ...eventDraft, contactIds: eventDraft.contactIds.includes(id) ? eventDraft.contactIds.filter((item) => item !== id) : [...eventDraft.contactIds, id] });
  }

  function contactName(id: string) {
    return contacts.find((contact) => contact.id === id)?.name ?? "Contato";
  }

  const contactResults = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return contacts.slice(0, 6);
    return contacts.filter((contact) => `${contact.name} ${contact.phone}`.toLowerCase().includes(q)).slice(0, 8);
  }, [contacts, contactQuery]);

  if (!agenda) return null;

  // ---- intervalos ----
  const weekStart = startOfDay(cursor);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const monthFirst = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthStart = addDays(monthFirst, -monthFirst.getDay());
  const monthCells = Array.from({ length: 42 }, (_, index) => addDays(monthStart, index));

  const connected = agenda.status === "conectado";
  const monthLabel = `${MONTHS[cursor.getMonth()]} de ${cursor.getFullYear()}`;
  const weekLabel = `${weekDays[0].getDate()} – ${weekDays[6].getDate()} de ${MONTHS[weekDays[6].getMonth()]}`;

  function eventsOn(day: Date) {
    return visibleEvents().filter((event) => sameDay(eventDate(event, today), day)).sort((a, b) => a.time.localeCompare(b.time));
  }

  function shift(days: number) {
    if (view === "mes") {
      const next = new Date(cursor);
      next.setMonth(next.getMonth() + days);
      setCursor(startOfDay(next));
    } else {
      setCursor(addDays(cursor, days));
    }
  }

  return (
    <div ref={pageRef} className="space-y-4">
      <PageHeader
        eyebrow="Clínica / Integrações de agenda"
        title="Agenda Google"
        description="Visualização estilo Google Agenda: selecione uma ou mais agendas, navegue por mês, semana ou dia e gerencie os eventos."
        aside={<span className="inline-flex items-center gap-2 rounded-full bg-clinical-blue/[0.09] px-3 py-2 text-xs font-extrabold text-clinical-blueText"><CalendarClock className="size-4" />{visibleEvents().length} eventos visíveis</span>}
        action={
          <div className="flex flex-wrap gap-2">
            {connected ? (
              <Button variant="secondary" onClick={() => setDisconnectOpen(true)}><Unlink className="size-4" />Desconectar</Button>
            ) : (
              <Button onClick={() => setAccountModal(true)}><Link2 className="size-4" />Conectar Google</Button>
            )}
            <Button variant="secondary" onClick={() => setConnectionOpen(true)}><ShieldCheck className="size-4" />Verificar conexão</Button>
            <Button onClick={() => openNewEvent()}><Plus className="size-4" />Novo evento</Button>
          </div>
        }
      />

      {notice ? (
        <div role="status" className="flex items-center justify-between rounded-2xl border border-clinical-green/20 bg-clinical-green/[0.08] px-4 py-3 text-sm font-bold text-clinical-green">
          <span className="flex items-center gap-2"><Check className="size-4" />{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Fechar aviso"><X className="size-4" /></button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* seletor de agendas */}
        <aside data-agenda-panel className="h-fit rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/75 p-4 shadow-[0_8px_22px_rgba(38,53,50,0.04)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-clinical-dark">Minhas agendas</h2>
            <button type="button" onClick={openNewCalendar} className="flex items-center gap-1 rounded-xl px-2 py-1 text-[12px] font-extrabold text-clinical-blue transition hover:bg-clinical-blue/[0.08]"><Plus className="size-3.5" />Nova agenda</button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {agenda.calendars.map((calendar) => {
              const checked = selectedIds.includes(calendar.id);
              return (
                <li key={calendar.id} className="group flex items-center gap-2 rounded-2xl border border-clinical-border/[0.10] bg-clinical-surfaceMuted/25 px-2.5 py-2">
                  <button type="button" onClick={() => toggleCalendar(calendar.id)} aria-pressed={checked} title={`${checked ? "Ocultar" : "Exibir"} ${calendar.name}`} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                    <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", checked ? "text-white" : "border-clinical-border/[0.25] bg-clinical-surface")} style={checked ? { backgroundColor: calendar.color, borderColor: calendar.color } : undefined}>
                      {checked ? <Check className="size-3.5" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-extrabold text-clinical-dark">{calendar.name}</span>
                      <span className="block text-[11px] font-bold text-clinical-muted">{calendar.eventsWeek} eventos/semana</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => openEditCalendar(calendar)} aria-label={`Editar ${calendar.name}`} title="Editar agenda" className="flex size-8 shrink-0 items-center justify-center rounded-xl text-clinical-muted opacity-0 transition hover:bg-clinical-blue/10 hover:text-clinical-blue group-hover:opacity-100"><Pencil className="size-3.5" /></button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 space-y-2 border-t border-clinical-border/[0.10] pt-3">
            <Toggle checked={agenda.autoSync} onChange={(value) => persistAgenda({ ...agenda, autoSync: value })} label="Sincronização automática" statusOn="A cada 5 min" statusOff="Manual" className="!px-3 !py-2" />
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-clinical-muted"><Clock3 className="size-3.5" />Última sincronização: {agenda.lastSync}</p>
          </div>
        </aside>

        {/* calendário */}
        <section data-agenda-panel className="flex min-h-[calc(100dvh-360px)] flex-col overflow-hidden rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/80 shadow-[0_8px_22px_rgba(38,53,50,0.04)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-clinical-border/[0.10] p-3">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => shift(view === "mes" ? -1 : view === "semana" ? -7 : -1)} aria-label="Período anterior" className="flex size-9 items-center justify-center rounded-xl text-clinical-muted transition hover:bg-clinical-blue/10 hover:text-clinical-blue"><ChevronLeft className="size-4" /></button>
              <button type="button" onClick={() => setCursor(startOfDay(new Date()))} className="rounded-xl px-3 py-2 text-[12px] font-extrabold text-clinical-blueText transition hover:bg-clinical-blue/[0.08]">Hoje</button>
              <button type="button" onClick={() => shift(view === "mes" ? 1 : view === "semana" ? 7 : 1)} aria-label="Próximo período" className="flex size-9 items-center justify-center rounded-xl text-clinical-muted transition hover:bg-clinical-blue/10 hover:text-clinical-blue"><ChevronRight className="size-4" /></button>
            </div>
            <h2 className="text-[15px] font-black capitalize tracking-tight text-clinical-dark">{view === "mes" ? monthLabel : view === "semana" ? `Semana · ${weekLabel}` : prettyDate(cursor, today)}</h2>
            <div className="ml-auto flex items-center gap-1 rounded-2xl bg-clinical-surfaceMuted/55 p-1" role="tablist" aria-label="Visualização">
              {([{ id: "dia", label: "Dia", icon: Clock3 }, { id: "semana", label: "Semana", icon: CalendarRange }, { id: "mes", label: "Mês", icon: CalendarDays }] as { id: CalendarView; label: string; icon: typeof Clock3 }[]).map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button" role="tab" aria-selected={view === item.id} onClick={() => setView(item.id)} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-extrabold transition", view === item.id ? "border border-clinical-blueHover/60 bg-[linear-gradient(140deg,rgb(var(--clinical-blue))_0%,rgb(var(--clinical-blue-hover))_100%)] text-clinical-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" : "border border-transparent text-clinical-muted hover:text-clinical-blue")}>
                    <Icon className="size-3.5" />{item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {view === "mes" ? (
            <div className="flex flex-1 flex-col">
              <div className="grid grid-cols-7 border-b border-clinical-border/[0.10]">
                {WEEKDAYS.map((day) => <p key={day} className="px-2 py-2 text-center text-[10px] font-black tracking-wider text-clinical-muted">{day}</p>)}
              </div>
              <div className="grid flex-1 auto-rows-fr grid-cols-7">
                {monthCells.map((day, index) => {
                  const inMonth = day.getMonth() === cursor.getMonth();
                  const isToday = sameDay(day, today);
                  const dayEvents = eventsOn(day);
                  return (
                    <button key={index} type="button" onClick={() => { setCursor(day); setView("dia"); }} className={cn("min-h-[86px] border-b border-r border-clinical-border/[0.08] p-1.5 text-left align-top transition last:border-r-0 hover:bg-clinical-blue/[0.04]", !inMonth && "bg-clinical-surfaceMuted/25")}>
                      <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-[12px] font-extrabold", isToday ? "bg-clinical-blue text-white" : inMonth ? "text-clinical-dark" : "text-clinical-muted/60")}>{day.getDate()}</span>
                      <span className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <span key={event.id} className="block truncate rounded-md px-1.5 py-0.5 text-[10px] font-extrabold text-white" style={{ backgroundColor: calendarColor(event.calendarId) }} title={`${event.time} · ${event.title}`}>{event.time} {event.title}</span>
                        ))}
                        {dayEvents.length > 3 ? <span className="block px-1.5 text-[10px] font-extrabold text-clinical-muted">+{dayEvents.length - 3}</span> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : view === "semana" ? (
            <div className="grid flex-1 grid-cols-1 sm:grid-cols-7 sm:divide-x sm:divide-clinical-border/[0.08]">
              {weekDays.map((day) => {
                const isToday = sameDay(day, today);
                const dayEvents = eventsOn(day);
                return (
                  <div key={day.toISOString()} className={cn("min-h-[120px] border-b border-clinical-border/[0.08] p-2 sm:border-b-0", isToday && "bg-clinical-blue/[0.04]")}>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[10px] font-black tracking-wider text-clinical-muted">{WEEKDAYS[day.getDay()]}</p>
                      <span className={cn("flex size-6 items-center justify-center rounded-full text-[12px] font-extrabold", isToday ? "bg-clinical-blue text-white" : "text-clinical-dark")}>{day.getDate()}</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {dayEvents.length === 0 ? <p className="text-[10px] font-bold text-clinical-muted/70">—</p> : null}
                      {dayEvents.map((event) => (
                        <button key={event.id} type="button" onClick={() => openEditEvent(event)} className="block w-full rounded-xl border-l-[3px] bg-clinical-surfaceMuted/40 p-2 text-left transition hover:bg-clinical-blue/[0.07]" style={{ borderLeftColor: calendarColor(event.calendarId) }} title={`${event.title} · ${event.time}`}>
                          <span className="block truncate text-[11px] font-extrabold text-clinical-dark">{event.title}</span>
                          <span className="mt-0.5 block text-[10px] font-bold text-clinical-muted">{event.time}{event.endTime ? `–${event.endTime}` : ""}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="clinical-scrollbar flex-1 overflow-y-auto p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[13px] font-extrabold text-clinical-dark">{eventsOn(cursor).length} eventos</p>
                <Button size="sm" variant="secondary" onClick={() => openNewEvent(cursor)}><Plus className="size-3.5" />Neste dia</Button>
              </div>
              {eventsOn(cursor).length === 0 ? (
                <p className="rounded-2xl border border-dashed border-clinical-border/[0.18] p-8 text-center text-sm font-semibold text-clinical-muted">Nenhum evento neste dia.</p>
              ) : (
                <ul className="space-y-2">
                  {eventsOn(cursor).map((event) => (
                    <li key={event.id} className="flex items-center gap-3 rounded-2xl border border-clinical-border/[0.10] bg-clinical-surfaceMuted/25 p-3">
                      <span className="h-12 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: calendarColor(event.calendarId) }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-clinical-dark">{event.title}</p>
                        <p className="truncate text-[12px] font-bold text-clinical-muted">{event.time}{event.endTime ? ` – ${event.endTime}` : ""} · {event.professional} · {calendarName(event.calendarId)}</p>
                        {event.clientName ? <p className="flex items-center gap-1 truncate text-[11px] font-bold text-clinical-blueText"><UserRound className="size-3" />{event.clientName}</p> : null}
                      </div>
                      <StatusBadge label={eventStatus[event.status].label} tone={eventStatus[event.status].tone} />
                      <button type="button" onClick={() => openEditEvent(event)} aria-label={`Editar ${event.title}`} title="Editar evento" className="flex size-9 shrink-0 items-center justify-center rounded-xl text-clinical-muted transition hover:bg-clinical-blue/10 hover:text-clinical-blue"><Pencil className="size-3.5" /></button>
                      <button type="button" onClick={() => setEventToDelete(event)} aria-label={`Remover ${event.title}`} title="Remover evento" className="flex size-9 shrink-0 items-center justify-center rounded-xl text-clinical-muted transition hover:bg-red-500/10 hover:text-red-500"><Trash2 className="size-3.5" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>

      {events.some((event) => event.status === "conflito") ? (
        <p className="flex items-start gap-2 rounded-[20px] border border-clinical-orange/20 bg-clinical-orange/[0.08] px-4 py-3 text-[12px] font-semibold leading-5 text-clinical-orange">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          Há conflitos de horário. Revise a agenda do profissional antes da sincronização completa.
        </p>
      ) : null}

      {/* modal verificar conexão */}
      <Modal open={connectionOpen} onClose={() => setConnectionOpen(false)} title="Dados de conexão" eyebrow="Google Agenda" description="Confira a conta vinculada e o estado da sincronização." icon={ShieldCheck} className="max-w-md">
        <dl className="space-y-2 rounded-2xl border border-clinical-border/[0.12] bg-clinical-surfaceMuted/30 p-4 text-[13px] font-bold">
          <div className="flex items-center justify-between gap-2"><dt className="uppercase tracking-wider text-clinical-muted">Conta</dt><dd className="text-clinical-dark">{agenda.account}</dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="uppercase tracking-wider text-clinical-muted">Status</dt><dd><StatusBadge label={connected ? "Conectado" : "Desconectado"} tone={connected ? "green" : "neutral"} /></dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="uppercase tracking-wider text-clinical-muted">Última sincronização</dt><dd className="text-clinical-dark">{agenda.lastSync}</dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="uppercase tracking-wider text-clinical-muted">Agendas</dt><dd className="text-clinical-dark">{agenda.calendars.length} vinculadas</dd></div>
          <div className="flex items-center justify-between gap-2"><dt className="uppercase tracking-wider text-clinical-muted">Eventos</dt><dd className="text-clinical-dark">{events.length} carregados</dd></div>
        </dl>
        <div className="mt-4 flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
          <Button variant="ghost" onClick={() => setConnectionOpen(false)}>Fechar</Button>
          <Button onClick={verifyConnection}><RefreshCw className="size-4" />Verificar agora</Button>
        </div>
      </Modal>

      {/* modal evento */}
      <Modal
        open={eventOpen}
        onClose={() => { setEventOpen(false); setEventEditing(null); }}
        title={eventEditing ? "Editar evento" : "Novo evento"}
        eyebrow="Google Agenda"
        description="Os campos seguem o padrão do Google Agenda."
        icon={CalendarClock}
        className="max-w-2xl"
      >
        {eventDraft ? (
          <form onSubmit={(event) => { event.preventDefault(); saveEvent(); }} className="space-y-4">
            <ModalField label="Título do evento" value={eventDraft.title} onChange={(event) => setEventDraft({ ...eventDraft, title: event.target.value })} placeholder="Ex.: Consulta — Cardiologia" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalSelect label="Agenda" value={eventDraft.calendarId} onChange={(event) => setEventDraft({ ...eventDraft, calendarId: event.target.value })}>
                {agenda.calendars.map((calendar) => <option key={calendar.id} value={calendar.id}>{calendar.name}</option>)}
              </ModalSelect>
              <ModalField label="Nome do cliente" icon={UserRound} value={eventDraft.clientName} onChange={(event) => setEventDraft({ ...eventDraft, clientName: event.target.value })} placeholder="Ex.: Amanda Souza" />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-extrabold text-clinical-dark">Contatos <span className="font-bold text-clinical-muted">({eventDraft.contactIds.length} selecionados · busca em tempo real)</span></p>
              <input
                value={contactQuery}
                onChange={(event) => setContactQuery(event.target.value)}
                placeholder="Buscar nos contatos por nome ou telefone…"
                aria-label="Buscar contatos"
                className="h-11 w-full rounded-2xl border border-clinical-border/[0.14] bg-clinical-surfaceMuted/45 px-3 text-sm font-semibold text-clinical-dark outline-none placeholder:text-clinical-muted/65 focus:border-clinical-blue/45"
              />
              <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-2xl border border-clinical-border/[0.12] bg-clinical-surfaceMuted/25 p-2">
                {contactResults.map((contact) => {
                  const checked = eventDraft.contactIds.includes(contact.id);
                  return (
                    <li key={contact.id}>
                      <button type="button" onClick={() => toggleDraftContact(contact.id)} aria-pressed={checked} className={cn("flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition", checked ? "bg-clinical-blue/[0.10]" : "hover:bg-clinical-surface")}>
                        <Avatar name={contact.name} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-extrabold text-clinical-dark">{contact.name}</span>
                          <span className="block truncate text-[11px] font-bold text-clinical-muted">{contact.phone}</span>
                        </span>
                        <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", checked ? "border-clinical-blue bg-clinical-blue text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>{checked ? <Check className="size-3.5" /> : null}</span>
                      </button>
                    </li>
                  );
                })}
                {contactResults.length === 0 ? <li className="p-3 text-center text-[12px] font-semibold text-clinical-muted">Nenhum contato encontrado.</li> : null}
              </ul>
              {eventDraft.contactIds.length ? <p className="mt-1.5 flex flex-wrap gap-1.5">{eventDraft.contactIds.map((id) => <span key={id} className="rounded-full bg-clinical-blue/[0.10] px-2.5 py-1 text-[11px] font-extrabold text-clinical-blueText">{contactName(id)}</span>)}</p> : null}
            </div>
            <ModalTextarea label="Descrição" value={eventDraft.description} onChange={(event) => setEventDraft({ ...eventDraft, description: event.target.value })} placeholder="Detalhes do evento…" />
            <div className="grid gap-4 sm:grid-cols-3">
              <ModalField label="Data de início" type="date" value={eventDraft.dateIso} onChange={(event) => setEventDraft({ ...eventDraft, dateIso: event.target.value })} required />
              <ModalField label="Hora de início" type="time" value={eventDraft.time} onChange={(event) => setEventDraft({ ...eventDraft, time: event.target.value })} required />
              <ModalField label="Hora de término" type="time" value={eventDraft.endTime} onChange={(event) => setEventDraft({ ...eventDraft, endTime: event.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ModalSelect label="Profissional" value={eventDraft.professional} onChange={(event) => setEventDraft({ ...eventDraft, professional: event.target.value })}>
                <option value="">A definir</option>
                {professionals.map((name) => <option key={name} value={name}>{name}</option>)}
              </ModalSelect>
              <ModalSelect label="Unidade" value={eventDraft.unit} onChange={(event) => setEventDraft({ ...eventDraft, unit: event.target.value })}>
                <option>Unidade Centro</option><option>Unidade Norte</option><option>Unidade Sul</option>
              </ModalSelect>
              <ModalField label="Local" value={eventDraft.location} onChange={(event) => setEventDraft({ ...eventDraft, location: event.target.value })} placeholder="Consultório 3" />
            </div>
            <div className="flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
              <Button type="button" variant="ghost" onClick={() => { setEventOpen(false); setEventEditing(null); }}>Cancelar</Button>
              <Button type="submit"><Check className="size-4" />{eventEditing ? "Salvar alterações" : "Criar evento"}</Button>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* modal agenda */}
      <Modal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title={calendarEditing ? "Editar agenda" : "Nova agenda"}
        eyebrow="Google Agenda"
        description="Agendas aparecem no seletor lateral e colorem os eventos."
        icon={CalendarDays}
        className="max-w-md"
      >
        {calendarDraft ? (
          <form onSubmit={(event) => { event.preventDefault(); saveCalendar(); }} className="space-y-4">
            <ModalField label="Nome da agenda" value={calendarDraft.name} onChange={(event) => setCalendarDraft({ ...calendarDraft, name: event.target.value })} placeholder="Ex.: Consultas — Unidade Sul" required />
            <ColorField label="Cor da agenda" value={calendarDraft.color} onChange={(color) => setCalendarDraft({ ...calendarDraft, color })} />
            <Toggle checked={calendarDraft.sync} onChange={(checked) => setCalendarDraft({ ...calendarDraft, sync: checked })} label="Exibir por padrão" hint="Agendas exibidas entram na contagem semanal." />
            <div className="flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
              <Button type="button" variant="ghost" onClick={() => setCalendarOpen(false)}>Cancelar</Button>
              <Button type="submit"><Check className="size-4" />{calendarEditing ? "Salvar alterações" : "Criar agenda"}</Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={accountModal}
        onClose={() => setAccountModal(false)}
        title="Conectar Google Agenda"
        eyebrow="Clínica / Integrações"
        description="Informe a conta Google que contém as agendas dos profissionais (demo local)."
        icon={Link2}
      >
        <form onSubmit={(event) => { event.preventDefault(); connect(); }} className="space-y-4">
          <ModalField label="Conta Google" icon={Link2} value={account} onChange={(event) => setAccount(event.target.value)} placeholder="agenda@ebotclinical.com.br" required />
          <div className="flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
            <Button type="button" variant="ghost" onClick={() => setAccountModal(false)}>Cancelar</Button>
            <Button type="submit"><Check className="size-4" />Conectar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={disconnect}
        title="Desconectar Google Agenda?"
        description="Os eventos já sincronizados permanecem na agenda interna, mas novas alterações não serão trocadas."
        confirmLabel="Desconectar"
      />

      <ConfirmationDialog
        open={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={removeEvent}
        title="Remover evento?"
        description={`O evento "${eventToDelete?.title ?? ""}" será removido da agenda (dados locais).`}
        confirmLabel="Remover evento"
      />
    </div>
  );
}
