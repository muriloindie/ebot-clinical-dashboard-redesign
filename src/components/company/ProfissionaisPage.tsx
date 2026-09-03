"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Check,
  IdCard,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Pencil,
  SearchX,
  Star,
  Stethoscope,
  UserPlus,
  X
} from "lucide-react";
import type { Professional, ProfessionalStatus } from "@/data/clinicMock";
import { deleteProfessional, listProfessionals, saveProfessional } from "@/lib/clinic/clinicService";
import { usePageEnter } from "@/lib/usePageEnter";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Modal } from "@/components/ui/Modal";
import { ModalField, ModalSelect } from "@/components/ui/ModalField";
import { Dropdown } from "@/components/ui/Dropdown";
import { SegmentedTabs, StatusBadge, PageHeader, SearchField, StatePanel } from "@/components/ui/Week1Primitives";
import { ViewSwitch } from "@/components/ui/ViewSwitch";

const ALL = "Todos";

const statusTone: Record<ProfessionalStatus, "green" | "orange" | "neutral" | "red"> = {
  ativo: "green",
  ferias: "orange",
  licenca: "orange",
  inativo: "neutral"
};

const statusLabel: Record<ProfessionalStatus, string> = {
  ativo: "Ativo",
  ferias: "Férias",
  licenca: "Licença",
  inativo: "Inativo"
};

const emptyForm = { id: "", name: "", registro: "", specialty: "", unit: "Unidade Centro", email: "", phone: "", status: "ativo" as ProfessionalStatus };

export function ProfissionaisPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Professional[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [specialty, setSpecialty] = useState(ALL);
  const [view, setView] = useState<"lista" | "cards">("lista");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState<Professional | null>(null);
  const [notice, setNotice] = useState("");

  usePageEnter(pageRef, [
    { selector: "[data-professional-card]", from: { opacity: 0, y: 18 } },
    { selector: "[data-filter-bar]", from: { opacity: 0, y: 14 }, to: { duration: 0.45, ease: "power3.out" } }
  ], { stagger: 0.05, delay: 0.05 });

  useEffect(() => setRows(listProfessionals()), []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  const specialties = useMemo(() => Array.from(new Set(rows.map((row) => row.specialty))).sort(), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = `${row.name} ${row.registro} ${row.specialty} ${row.unit} ${row.email}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === ALL
        || (statusFilter === "ativo" && row.status === "ativo")
        || (statusFilter === "afastado" && (row.status === "ferias" || row.status === "licenca"))
        || (statusFilter === "inativo" && row.status === "inativo");
      const matchesSpecialty = specialty === ALL || row.specialty === specialty;
      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [rows, search, statusFilter, specialty]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(professional: Professional) {
    setEditing(professional);
    setForm({ id: professional.id, name: professional.name, registro: professional.registro, specialty: professional.specialty, unit: professional.unit, email: professional.email, phone: professional.phone, status: professional.status });
    setFormOpen(true);
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.registro.trim() || !form.specialty.trim()) {
      showNotice("Informe nome, registro profissional e especialidade.");
      return;
    }
    const base = editing ?? rows.find((row) => row.id === form.id);
    const next: Professional = {
      id: editing?.id ?? `prof-${Date.now().toString(36)}`,
      name: form.name.trim(),
      registro: form.registro.trim(),
      specialty: form.specialty.trim(),
      unit: form.unit,
      email: form.email.trim(),
      phone: form.phone.trim(),
      convenioIds: base?.convenioIds ?? [],
      exameIds: base?.exameIds ?? [],
      status: form.status,
      consultationsMonth: base?.consultationsMonth ?? 0,
      rating: base?.rating ?? 0,
      avatarColor: base?.avatarColor ?? "#3A9DCA"
    };
    saveProfessional(next);
    setRows(listProfessionals());
    setFormOpen(false);
    showNotice(base ? `Profissional "${next.name}" atualizado.` : `Profissional "${next.name}" cadastrado.`);
  }

  function confirmDelete() {
    if (!toDelete) return;
    deleteProfessional(toDelete.id);
    setRows(listProfessionals());
    setToDelete(null);
    showNotice(`Profissional "${toDelete.name}" removido.`);
  }

  const activeCount = rows.filter((row) => row.status === "ativo").length;

  return (
    <div ref={pageRef} className="space-y-4">
      <PageHeader
        eyebrow="Clínica / Corpo clínico"
        title="Profissionais"
        description="Cadastro dos profissionais da clínica: registros, especialidades, unidades e vínculos com convênios e exames."
        aside={<span className="inline-flex items-center gap-2 rounded-full bg-clinical-green/[0.09] px-3 py-2 text-xs font-extrabold text-clinical-green"><BadgeCheck className="size-4" />{activeCount} ativos de {rows.length}</span>}
        action={<Button onClick={openCreate}><UserPlus className="size-4" />Novo profissional</Button>}
      />

      {notice ? (
        <div role="status" className="flex items-center justify-between rounded-2xl border border-clinical-green/20 bg-clinical-green/[0.08] px-4 py-3 text-sm font-bold text-clinical-green">
          <span className="flex items-center gap-2"><Check className="size-4" />{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Fechar aviso"><X className="size-4" /></button>
        </div>
      ) : null}

      <div data-filter-bar className="flex flex-col gap-2 rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/70 p-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nome, registro, especialidade ou e-mail" />
          <ViewSwitch
            views={[{ id: "lista", label: "Lista", icon: List }, { id: "cards", label: "Cards", icon: LayoutGrid }]}
            value={view}
            onChange={(id) => setView(id as "lista" | "cards")}
            className="self-end sm:self-auto"
          />
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedTabs
            tabs={[
              { id: ALL, label: "Todos", count: rows.length },
              { id: "ativo", label: "Ativos", count: rows.filter((row) => row.status === "ativo").length },
              { id: "afastado", label: "Férias/Licença", count: rows.filter((row) => row.status === "ferias" || row.status === "licenca").length },
              { id: "inativo", label: "Inativos", count: rows.filter((row) => row.status === "inativo").length }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <div className="w-full lg:w-60">
            <Dropdown label="Especialidade" value={specialty} options={[ALL, ...specialties]} onChange={setSpecialty} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <StatePanel
          icon={SearchX}
          title="Nenhum profissional encontrado"
          description="Ajuste a busca ou os filtros de status e especialidade."
          action={<Button size="sm" variant="secondary" onClick={() => { setSearch(""); setStatusFilter(ALL); setSpecialty(ALL); }}>Limpar filtros</Button>}
        />
      ) : view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((professional) => (
            <article
              key={professional.id}
              data-professional-card
              className="flex flex-col rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/75 p-5 shadow-[0_8px_22px_rgba(38,53,50,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-clinical-blue/30 hover:bg-clinical-surface hover:shadow-card dark:shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={professional.name} size="lg" className="shrink-0" />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-extrabold tracking-tight text-clinical-dark">{professional.name}</h2>
                    <p className="flex items-center gap-1.5 text-[12px] font-bold text-clinical-muted"><IdCard className="size-3.5 shrink-0" />{professional.registro}</p>
                  </div>
                </div>
                <StatusBadge label={statusLabel[professional.status]} tone={statusTone[professional.status]} />
              </div>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-clinical-blue/[0.08] px-2.5 py-1 text-[11px] font-extrabold text-clinical-blueText"><Stethoscope className="size-3" />{professional.specialty}</span>
                <span className="rounded-full bg-clinical-surfaceMuted px-2.5 py-1 text-[11px] font-bold text-clinical-muted">{professional.unit}</span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-clinical-border/[0.10] bg-clinical-surfaceMuted/30 p-2.5"><dt className="text-[10px] font-extrabold uppercase tracking-wider text-clinical-muted">Consultas no mês</dt><dd className="mt-0.5 text-sm font-extrabold tabular-nums text-clinical-dark">{professional.consultationsMonth}</dd></div>
                <div className="rounded-2xl border border-clinical-border/[0.10] bg-clinical-surfaceMuted/30 p-2.5"><dt className="text-[10px] font-extrabold uppercase tracking-wider text-clinical-muted">Avaliação</dt><dd className="mt-0.5 flex items-center gap-1 text-sm font-extrabold text-clinical-dark"><Star className="size-3.5 text-clinical-orange" />{professional.rating ? professional.rating.toFixed(1).replace(".", ",") : "—"}</dd></div>
              </dl>

              <div className="mt-3 space-y-1.5 text-xs font-semibold text-clinical-muted">
                <p className="flex items-center gap-1.5 truncate"><Mail className="size-3.5 shrink-0 text-clinical-blue" />{professional.email}</p>
                <p className="flex items-center gap-1.5"><Phone className="size-3.5 shrink-0 text-clinical-blue" />{professional.phone}</p>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-clinical-border/[0.10] pt-3.5">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(professional)}><Pencil className="size-3.5" />Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => setToDelete(professional)} aria-label={`Remover ${professional.name}`}><X className="size-3.5" /></Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/80 shadow-[0_8px_22px_rgba(38,53,50,0.04)]">
          <ul className="divide-y divide-clinical-border/[0.10]" aria-label="Lista de profissionais">
            {filtered.map((professional) => (
              <li key={professional.id} data-professional-item data-professional-id={professional.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition hover:bg-clinical-blue/[0.035] sm:flex-nowrap">
                <Avatar name={professional.name} size="md" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-clinical-dark">{professional.name}</p>
                  <p className="truncate text-xs font-semibold text-clinical-muted">{professional.registro} · {professional.specialty} · {professional.unit}</p>
                </div>
                <span className="hidden shrink-0 items-center gap-1 text-xs font-extrabold text-clinical-muted md:flex"><Star className="size-3.5 text-clinical-orange" />{professional.rating ? professional.rating.toFixed(1).replace(".", ",") : "—"}</span>
                <StatusBadge label={statusLabel[professional.status]} tone={statusTone[professional.status]} />
                <div className="flex shrink-0 items-center gap-0.5">
                  <button type="button" onClick={() => openEdit(professional)} aria-label={`Editar ${professional.name}`} title="Editar" className="flex size-9 items-center justify-center rounded-xl text-clinical-muted transition hover:bg-clinical-blue/10 hover:text-clinical-blue"><Pencil className="size-3.5" /></button>
                  <button type="button" onClick={() => setToDelete(professional)} aria-label={`Remover ${professional.name}`} title="Remover" className="flex size-9 items-center justify-center rounded-xl text-clinical-muted transition hover:bg-red-500/10 hover:text-red-500"><X className="size-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar profissional" : "Novo profissional"}
        eyebrow="Clínica / Corpo clínico"
        description="Os vínculos com convênios e exames são gerenciados nas telas correspondentes."
        icon={Stethoscope}
        className="max-w-2xl"
      >
        <form onSubmit={submitForm} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Nome completo" icon={Stethoscope} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Dra. Camila Duarte" required />
            <ModalField label="Registro profissional" icon={IdCard} value={form.registro} onChange={(event) => setForm({ ...form, registro: event.target.value })} placeholder="Ex.: CRM 90117-PR" required />
            <ModalField label="Especialidade" value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} placeholder="Ex.: Cardiologia" required />
            <ModalSelect label="Unidade" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>
              <option>Unidade Centro</option><option>Unidade Norte</option><option>Unidade Sul</option>
            </ModalSelect>
            <ModalField label="E-mail" icon={Mail} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nome@ebotclinical.com.br" />
            <ModalField label="Telefone" icon={Phone} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+55 46 99999-0000" />
          </div>
          <ModalSelect label="Situação" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProfessionalStatus })}>
            <option value="ativo">Ativo</option><option value="ferias">Férias</option><option value="licenca">Licença</option><option value="inativo">Inativo</option>
          </ModalSelect>
          <div className="flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit"><Check className="size-4" />{editing ? "Salvar alterações" : "Cadastrar profissional"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remover profissional?"
        description={`"${toDelete?.name ?? ""}" será removido do corpo clínico local.`}
        confirmLabel="Remover"
      />
    </div>
  );
}
