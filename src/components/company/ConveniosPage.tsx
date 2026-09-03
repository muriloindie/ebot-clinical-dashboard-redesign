"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardList, FileCheck2, HeartPulse, Pencil, Plus, SearchX, TrendingUp, UserRound, UsersRound, X } from "lucide-react";
import type { Convenio, Exam } from "@/data/clinicMock";
import { listConvenios, listExams, listProfessionals, saveConvenio, saveExam, deleteConvenio, saveProfessional } from "@/lib/clinic/clinicService";
import type { Professional } from "@/data/clinicMock";
import { usePageEnter } from "@/lib/usePageEnter";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Modal } from "@/components/ui/Modal";
import { ModalField, ModalSelect } from "@/components/ui/ModalField";
import { SegmentedTabs, StatusBadge, PageHeader, SearchField, StatePanel } from "@/components/ui/Week1Primitives";
import { cn } from "@/lib/cn";

const ALL = "Todos";

const statusTone: Record<Convenio["status"], "green" | "orange" | "neutral"> = {
  ativo: "green",
  negociacao: "orange",
  inativo: "neutral"
};

const statusLabel: Record<Convenio["status"], string> = {
  ativo: "Ativo",
  negociacao: "Em negociação",
  inativo: "Inativo"
};

const emptyForm = { id: "", name: "", ansCode: "", coverage: "", status: "ativo" as Convenio["status"], professionalIds: [] as string[], examIds: [] as string[] };

export function ConveniosPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Convenio[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Convenio | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formSearch, setFormSearch] = useState("");
  const [relation, setRelation] = useState<Convenio | null>(null);
  const [relationTab, setRelationTab] = useState<"professionals" | "exams">("professionals");
  const [relationIds, setRelationIds] = useState<string[]>([]);
  const [relationExamIds, setRelationExamIds] = useState<string[]>([]);
  const [relationSearch, setRelationSearch] = useState("");
  const [toDelete, setToDelete] = useState<Convenio | null>(null);
  const [notice, setNotice] = useState("");

  usePageEnter(pageRef, [
    { selector: "[data-convenio-card]", from: { opacity: 0, y: 18 } },
    { selector: "[data-filter-bar]", from: { opacity: 0, y: 14 }, to: { duration: 0.45, ease: "power3.out" } }
  ], { stagger: 0.06, delay: 0.05 });

  useEffect(() => {
    setRows(listConvenios());
    setProfessionals(listProfessionals());
    setExams(listExams());
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = `${row.name} ${row.ansCode} ${row.coverage}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === ALL || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  function professionalName(id: string) {
    return professionals.find((professional) => professional.id === id)?.name ?? "Profissional";
  }

  function examName(id: string) {
    return exams.find((exam) => exam.id === id)?.name ?? "Exame";
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormSearch("");
    setFormOpen(true);
  }

  function openEdit(convenio: Convenio) {
    setEditing(convenio);
    setForm({ id: convenio.id, name: convenio.name, ansCode: convenio.ansCode, coverage: convenio.coverage, status: convenio.status, professionalIds: convenio.professionalIds, examIds: convenio.examIds });
    setFormSearch("");
    setFormOpen(true);
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      showNotice("Informe o nome do convênio.");
      return;
    }
    const base = editing ?? rows.find((row) => row.id === form.id);
    const next: Convenio = {
      id: editing?.id ?? `conv-${Date.now().toString(36)}`,
      name: form.name.trim(),
      ansCode: form.ansCode.trim() || "—",
      coverage: form.coverage.trim() || "Cobertura a definir",
      status: form.status,
      professionalIds: form.professionalIds,
      examIds: form.examIds,
      sessionsMonth: base?.sessionsMonth ?? 0,
      updatedAt: "Agora"
    };
    saveConvenio(next);
    mirrorRelations(next);
    setRows(listConvenios());
    setProfessionals(listProfessionals());
    setExams(listExams());
    setFormOpen(false);
    showNotice(base ? `Convênio "${next.name}" atualizado.` : `Convênio "${next.name}" cadastrado.`);
  }

  function mirrorRelations(convenio: Convenio) {
    // espelha o vínculo nos cadastros de profissionais e exames
    professionals.forEach((professional) => {
      const linked = convenio.professionalIds.includes(professional.id);
      const already = professional.convenioIds.includes(convenio.id);
      if (linked === already) return;
      saveProfessional({
        ...professional,
        convenioIds: linked ? [...professional.convenioIds, convenio.id] : professional.convenioIds.filter((item) => item !== convenio.id)
      });
    });
    exams.forEach((exam) => {
      const linked = convenio.examIds.includes(exam.id);
      const already = exam.convenioIds.includes(convenio.id);
      if (linked === already) return;
      saveExam({
        ...exam,
        convenioIds: linked ? [...exam.convenioIds, convenio.id] : exam.convenioIds.filter((item) => item !== convenio.id)
      });
    });
  }

  function openRelation(convenio: Convenio) {
    setRelation(convenio);
    setRelationTab("professionals");
    setRelationIds(convenio.professionalIds);
    setRelationExamIds(convenio.examIds);
    setRelationSearch("");
  }

  function toggleRelation(id: string) {
    setRelationIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleRelationExam(id: string) {
    setRelationExamIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function saveRelation() {
    if (!relation) return;
    const next: Convenio = { ...relation, professionalIds: relationIds, examIds: relationExamIds, updatedAt: "Agora" };
    saveConvenio(next);
    mirrorRelations(next);
    setRows(listConvenios());
    setProfessionals(listProfessionals());
    setExams(listExams());
    setRelation(null);
    showNotice(`Relacionamento de "${relation.name}" salvo com ${relationIds.length} profissional(is) e ${relationExamIds.length} exame(s).`);
  }

  function confirmDelete() {
    if (!toDelete) return;
    deleteConvenio(toDelete.id);
    setRows(listConvenios());
    setToDelete(null);
    showNotice(`Convênio "${toDelete.name}" removido.`);
  }

  return (
    <div ref={pageRef} className="space-y-4">
      <PageHeader
        eyebrow="Clínica / Convênios"
        title="Convênios"
        description="Planos de saúde aceitos pela clínica, com cobertura, situação do contrato e relação com os profissionais credenciados."
        aside={<span className="inline-flex items-center gap-2 rounded-full bg-clinical-green/[0.09] px-3 py-2 text-xs font-extrabold text-clinical-green"><FileCheck2 className="size-4" />{rows.filter((row) => row.status === "ativo").length} ativos</span>}
        action={<Button onClick={openCreate}><Plus className="size-4" />Novo convênio</Button>}
      />

      {notice ? (
        <div role="status" className="flex items-center justify-between rounded-2xl border border-clinical-green/20 bg-clinical-green/[0.08] px-4 py-3 text-sm font-bold text-clinical-green">
          <span className="flex items-center gap-2"><Check className="size-4" />{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Fechar aviso"><X className="size-4" /></button>
        </div>
      ) : null}

      <div data-filter-bar className="flex flex-col gap-2 rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/70 p-2.5">
        <SearchField value={search} onChange={setSearch} placeholder="Buscar convênio por nome, registro ANS ou cobertura" />
        <SegmentedTabs
          tabs={[
            { id: ALL, label: "Todos", count: rows.length },
            { id: "ativo", label: "Ativos", count: rows.filter((row) => row.status === "ativo").length },
            { id: "negociacao", label: "Em negociação", count: rows.filter((row) => row.status === "negociacao").length },
            { id: "inativo", label: "Inativos", count: rows.filter((row) => row.status === "inativo").length }
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <StatePanel
          icon={SearchX}
          title="Nenhum convênio encontrado"
          description="Ajuste a busca ou o filtro de situação."
          action={<Button size="sm" variant="secondary" onClick={() => { setSearch(""); setStatusFilter(ALL); }}>Limpar filtros</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((convenio) => (
            <article
              key={convenio.id}
              data-convenio-card
              className="flex flex-col rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/75 p-5 shadow-[0_8px_22px_rgba(38,53,50,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-clinical-blue/30 hover:bg-clinical-surface hover:shadow-card dark:shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-clinical-green/[0.10] text-clinical-green"><HeartPulse className="size-5" /></span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-extrabold tracking-tight text-clinical-dark">{convenio.name}</h2>
                    <p className="text-[11px] font-bold text-clinical-muted">{convenio.ansCode === "—" ? "Pagamento direto" : `Registro ${convenio.ansCode}`}</p>
                  </div>
                </div>
                <StatusBadge label={statusLabel[convenio.status]} tone={statusTone[convenio.status]} />
              </div>

              <p className="mt-3 text-[13px] leading-5 text-clinical-muted">{convenio.coverage}</p>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-clinical-border/[0.10] bg-clinical-surfaceMuted/30 p-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-clinical-muted">Atendimentos no mês</span>
                <span className="flex items-center gap-1 text-sm font-extrabold tabular-nums text-clinical-dark"><TrendingUp className="size-3.5 text-clinical-green" />{convenio.sessionsMonth}</span>
              </div>

              <div className="mt-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-clinical-muted"><UsersRound className="size-3.5" />Profissionais relacionados ({convenio.professionalIds.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {convenio.professionalIds.length === 0 ? (
                    <span className="text-xs font-semibold text-clinical-muted">Nenhum profissional vinculado.</span>
                  ) : (
                    convenio.professionalIds.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-clinical-blue/[0.08] px-2.5 py-1 text-[11px] font-bold text-clinical-blueText"><UserRound className="size-3" />{professionalName(id)}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-clinical-muted"><ClipboardList className="size-3.5" />Exames abrangentes ({convenio.examIds.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {convenio.examIds.length === 0 ? (
                    <span className="text-xs font-semibold text-clinical-muted">Nenhum exame vinculado.</span>
                  ) : (
                    convenio.examIds.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-clinical-teal/[0.10] px-2.5 py-1 text-[11px] font-bold text-clinical-teal"><ClipboardList className="size-3" />{examName(id)}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-clinical-border/[0.10] pt-3.5">
                <Button size="sm" className="flex-1" onClick={() => openRelation(convenio)}><UsersRound className="size-3.5" />Relacionar</Button>
                <Button size="sm" variant="secondary" onClick={() => openEdit(convenio)} aria-label={`Editar ${convenio.name}`}><Pencil className="size-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setToDelete(convenio)} aria-label={`Remover ${convenio.name}`}><X className="size-3.5" /></Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar convênio" : "Novo convênio"}
        eyebrow="Clínica / Convênios"
        description="Cadastre o plano e depois relacione os profissionais credenciados."
        icon={HeartPulse}
        className="max-w-xl"
      >
        <form onSubmit={submitForm} className="space-y-4">
          <ModalField label="Nome do convênio" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Unimed" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Registro ANS" value={form.ansCode} onChange={(event) => setForm({ ...form, ansCode: event.target.value })} placeholder="Ex.: ANS 339645" />
            <ModalSelect label="Situação" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Convenio["status"] })}>
              <option value="ativo">Ativo</option><option value="negociacao">Em negociação</option><option value="inativo">Inativo</option>
            </ModalSelect>
          </div>
          <ModalField label="Cobertura" value={form.coverage} onChange={(event) => setForm({ ...form, coverage: event.target.value })} placeholder="Ex.: Consultas, exames e internação" />
          <div>
            <p className="mb-1.5 text-sm font-extrabold text-clinical-dark">Profissionais e exames abrangentes</p>
            <SearchField value={formSearch} onChange={setFormSearch} placeholder="Pesquisar profissionais ou exames…" />
            <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto rounded-2xl border border-clinical-border/[0.12] bg-clinical-surfaceMuted/25 p-2">
              <p className="px-1 pt-1 text-[10px] font-extrabold uppercase tracking-wider text-clinical-muted">Profissionais</p>
              {professionals
                .filter((professional) => `${professional.name} ${professional.specialty}`.toLowerCase().includes(formSearch.toLowerCase()))
                .map((professional) => {
                  const checked = form.professionalIds.includes(professional.id);
                  return (
                    <button key={professional.id} type="button" onClick={() => setForm({ ...form, professionalIds: checked ? form.professionalIds.filter((id) => id !== professional.id) : [...form.professionalIds, professional.id] })} aria-pressed={checked} className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-bold transition", checked ? "bg-clinical-blue/[0.10] text-clinical-blueText" : "text-clinical-slate hover:bg-clinical-surface")}>
                      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", checked ? "border-clinical-blue bg-clinical-blue text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>{checked ? <Check className="size-3.5" /> : null}</span>
                      <span className="truncate">{professional.name} · {professional.specialty}</span>
                    </button>
                  );
                })}
              <p className="px-1 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-clinical-muted">Exames</p>
              {exams
                .filter((exam) => `${exam.name} ${exam.category}`.toLowerCase().includes(formSearch.toLowerCase()))
                .map((exam) => {
                  const checked = form.examIds.includes(exam.id);
                  return (
                    <button key={exam.id} type="button" onClick={() => setForm({ ...form, examIds: checked ? form.examIds.filter((id) => id !== exam.id) : [...form.examIds, exam.id] })} aria-pressed={checked} className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-bold transition", checked ? "bg-clinical-teal/[0.12] text-clinical-teal" : "text-clinical-slate hover:bg-clinical-surface")}>
                      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", checked ? "border-clinical-teal bg-clinical-teal text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>{checked ? <Check className="size-3.5" /> : null}</span>
                      <span className="truncate">{exam.name} · {exam.category}</span>
                    </button>
                  );
                })}
            </div>
            <p className="mt-1.5 text-xs font-semibold text-clinical-muted">{form.professionalIds.length} profissional(is) · {form.examIds.length} exame(s) selecionados.</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit"><Check className="size-4" />{editing ? "Salvar alterações" : "Cadastrar convênio"}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(relation)}
        onClose={() => setRelation(null)}
        title={`Relacionar — ${relation?.name ?? ""}`}
        eyebrow="Clínica / Convênios"
        description="Selecione os profissionais credenciados e os exames abrangentes deste convênio."
        icon={UsersRound}
        className="max-w-xl"
      >
        <div className="mb-3 flex gap-1 rounded-2xl border border-clinical-border/[0.12] bg-clinical-surfaceMuted/40 p-1">
          <button type="button" onClick={() => setRelationTab("professionals")} aria-pressed={relationTab === "professionals"} className={cn("flex-1 rounded-xl px-3 py-2 text-[13px] font-extrabold transition", relationTab === "professionals" ? "bg-clinical-surface text-clinical-blue shadow-sm" : "text-clinical-muted hover:text-clinical-dark")}>
            Profissionais ({relationIds.length})
          </button>
          <button type="button" onClick={() => setRelationTab("exams")} aria-pressed={relationTab === "exams"} className={cn("flex-1 rounded-xl px-3 py-2 text-[13px] font-extrabold transition", relationTab === "exams" ? "bg-clinical-surface text-clinical-blue shadow-sm" : "text-clinical-muted hover:text-clinical-dark")}>
            Exames ({relationExamIds.length})
          </button>
        </div>
        <SearchField value={relationSearch} onChange={setRelationSearch} placeholder={relationTab === "professionals" ? "Pesquisar profissionais…" : "Pesquisar exames…"} />
        <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
          {relationTab === "professionals" ? (
            professionals
              .filter((professional) => `${professional.name} ${professional.specialty} ${professional.registro}`.toLowerCase().includes(relationSearch.toLowerCase()))
              .map((professional) => {
                const checked = relationIds.includes(professional.id);
                return (
                  <button
                    key={professional.id}
                    type="button"
                    onClick={() => toggleRelation(professional.id)}
                    aria-pressed={checked}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition",
                      checked ? "border-clinical-blue/30 bg-clinical-blue/[0.08]" : "border-clinical-border/[0.12] bg-clinical-surfaceMuted/30 hover:border-clinical-blue/20"
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-black", checked ? "bg-clinical-blue text-white" : "bg-clinical-surfaceMuted text-clinical-muted")} style={checked ? { backgroundColor: professional.avatarColor } : undefined}>
                        {checked ? <Check className="size-4" /> : professional.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold text-clinical-dark">{professional.name}</span>
                        <span className="block truncate text-[11px] font-bold text-clinical-muted">{professional.specialty} · {professional.registro}</span>
                      </span>
                    </span>
                    <span className={cn("size-5 shrink-0 rounded-md border", checked ? "border-clinical-blue bg-clinical-blue text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>
                      {checked ? <Check className="size-4" /> : null}
                    </span>
                  </button>
                );
              })
          ) : (
            exams
              .filter((exam) => `${exam.name} ${exam.category}`.toLowerCase().includes(relationSearch.toLowerCase()))
              .map((exam) => {
                const checked = relationExamIds.includes(exam.id);
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => toggleRelationExam(exam.id)}
                    aria-pressed={checked}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition",
                      checked ? "border-clinical-teal/30 bg-clinical-teal/[0.08]" : "border-clinical-border/[0.12] bg-clinical-surfaceMuted/30 hover:border-clinical-teal/25"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-clinical-dark">{exam.name}</span>
                      <span className="block truncate text-[11px] font-bold text-clinical-muted">{exam.category} · {exam.duration}</span>
                    </span>
                    <span className={cn("size-5 shrink-0 rounded-md border", checked ? "border-clinical-teal bg-clinical-teal text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>
                      {checked ? <Check className="size-4" /> : null}
                    </span>
                  </button>
                );
              })
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
          <Button type="button" variant="ghost" onClick={() => setRelation(null)}>Cancelar</Button>
          <Button onClick={saveRelation}><Check className="size-4" />Salvar relacionamento</Button>
        </div>
      </Modal>

      <ConfirmationDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remover convênio?"
        description={`"${toDelete?.name ?? ""}" será removido da lista local.`}
        confirmLabel="Remover"
      />
    </div>
  );
}
