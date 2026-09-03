"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock3, FlaskConical, HeartPulse, Microscope, Pencil, Plus, SearchX, UserRound, UsersRound, X } from "lucide-react";
import type { Convenio, Exam } from "@/data/clinicMock";
import { deleteExam, listConvenios, listExams, listProfessionals, saveConvenio, saveExam, saveProfessional } from "@/lib/clinic/clinicService";
import type { Professional } from "@/data/clinicMock";
import { usePageEnter } from "@/lib/usePageEnter";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Modal } from "@/components/ui/Modal";
import { ModalField, ModalSelect } from "@/components/ui/ModalField";
import { SegmentedTabs, StatusBadge, PageHeader, SearchField, StatePanel } from "@/components/ui/Week1Primitives";
import { cn } from "@/lib/cn";

const ALL = "Todos";

const categoryTone: Record<Exam["category"], string> = {
  Imagem: "bg-clinical-blue/10 text-clinical-blueText",
  Laboratorial: "bg-clinical-teal/12 text-clinical-teal",
  "Cardiológico": "bg-clinical-orange/12 text-clinical-orange"
};

const emptyForm = { id: "", name: "", category: "Laboratorial" as Exam["category"], preparation: "", duration: "", status: "ativo" as Exam["status"], professionalIds: [] as string[], convenioIds: [] as string[] };

export function ExamesPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Exam[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formSearch, setFormSearch] = useState("");
  const [relation, setRelation] = useState<Exam | null>(null);
  const [relationTab, setRelationTab] = useState<"professionals" | "convenios">("professionals");
  const [relationIds, setRelationIds] = useState<string[]>([]);
  const [relationConvenioIds, setRelationConvenioIds] = useState<string[]>([]);
  const [relationSearch, setRelationSearch] = useState("");
  const [toDelete, setToDelete] = useState<Exam | null>(null);
  const [notice, setNotice] = useState("");

  usePageEnter(pageRef, [
    { selector: "[data-exam-card]", from: { opacity: 0, y: 18 } },
    { selector: "[data-filter-bar]", from: { opacity: 0, y: 14 }, to: { duration: 0.45, ease: "power3.out" } }
  ], { stagger: 0.06, delay: 0.05 });

  useEffect(() => {
    setRows(listExams());
    setProfessionals(listProfessionals());
    setConvenios(listConvenios());
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = `${row.name} ${row.category} ${row.preparation}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === ALL || row.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [rows, search, categoryFilter]);

  function professionalName(id: string) {
    return professionals.find((professional) => professional.id === id)?.name ?? "Profissional";
  }

  function convenioName(id: string) {
    return convenios.find((convenio) => convenio.id === id)?.name ?? "Convênio";
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormSearch("");
    setFormOpen(true);
  }

  function openEdit(exam: Exam) {
    setEditing(exam);
    setForm({ id: exam.id, name: exam.name, category: exam.category, preparation: exam.preparation, duration: exam.duration, status: exam.status, professionalIds: exam.professionalIds, convenioIds: exam.convenioIds });
    setFormSearch("");
    setFormOpen(true);
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      showNotice("Informe o nome do exame.");
      return;
    }
    const base = editing ?? rows.find((row) => row.id === form.id);
    const next: Exam = {
      id: editing?.id ?? `exm-${Date.now().toString(36)}`,
      name: form.name.trim(),
      category: form.category,
      preparation: form.preparation.trim() || "Sem preparo necessário",
      duration: form.duration.trim() || "30 min",
      status: form.status,
      professionalIds: form.professionalIds,
      convenioIds: form.convenioIds,
      sessionsMonth: base?.sessionsMonth ?? 0
    };
    saveExam(next);
    mirrorRelations(next);
    setRows(listExams());
    setProfessionals(listProfessionals());
    setConvenios(listConvenios());
    setFormOpen(false);
    showNotice(base ? `Exame "${next.name}" atualizado.` : `Exame "${next.name}" cadastrado.`);
  }

  function mirrorRelations(exam: Exam) {
    professionals.forEach((professional) => {
      const linked = exam.professionalIds.includes(professional.id);
      const already = professional.exameIds.includes(exam.id);
      if (linked === already) return;
      saveProfessional({
        ...professional,
        exameIds: linked ? [...professional.exameIds, exam.id] : professional.exameIds.filter((item) => item !== exam.id)
      });
    });
    convenios.forEach((convenio) => {
      const linked = exam.convenioIds.includes(convenio.id);
      const already = convenio.examIds.includes(exam.id);
      if (linked === already) return;
      saveConvenio({
        ...convenio,
        examIds: linked ? [...convenio.examIds, exam.id] : convenio.examIds.filter((item) => item !== exam.id)
      });
    });
  }

  function openRelation(exam: Exam) {
    setRelation(exam);
    setRelationTab("professionals");
    setRelationIds(exam.professionalIds);
    setRelationConvenioIds(exam.convenioIds);
    setRelationSearch("");
  }

  function toggleRelation(id: string) {
    setRelationIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleRelationConvenio(id: string) {
    setRelationConvenioIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function saveRelation() {
    if (!relation) return;
    const next: Exam = { ...relation, professionalIds: relationIds, convenioIds: relationConvenioIds };
    saveExam(next);
    mirrorRelations(next);
    setRows(listExams());
    setProfessionals(listProfessionals());
    setConvenios(listConvenios());
    setRelation(null);
    showNotice(`Relacionamento de "${relation.name}" salvo com ${relationIds.length} profissional(is) e ${relationConvenioIds.length} convênio(s).`);
  }

  function confirmDelete() {
    if (!toDelete) return;
    deleteExam(toDelete.id);
    setRows(listExams());
    setToDelete(null);
    showNotice(`Exame "${toDelete.name}" removido.`);
  }

  return (
    <div ref={pageRef} className="space-y-4">
      <PageHeader
        eyebrow="Clínica / Exames"
        title="Exames"
        description="Catálogo de exames da clínica com preparo, duração e os profissionais habilitados a realizar cada um."
        aside={<span className="inline-flex items-center gap-2 rounded-full bg-clinical-teal/[0.10] px-3 py-2 text-xs font-extrabold text-clinical-teal"><FlaskConical className="size-4" />{rows.length} exames no catálogo</span>}
        action={<Button onClick={openCreate}><Plus className="size-4" />Novo exame</Button>}
      />

      {notice ? (
        <div role="status" className="flex items-center justify-between rounded-2xl border border-clinical-green/20 bg-clinical-green/[0.08] px-4 py-3 text-sm font-bold text-clinical-green">
          <span className="flex items-center gap-2"><Check className="size-4" />{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Fechar aviso"><X className="size-4" /></button>
        </div>
      ) : null}

      <div data-filter-bar className="flex flex-col gap-2 rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/70 p-2.5">
        <SearchField value={search} onChange={setSearch} placeholder="Buscar exame por nome, categoria ou preparo" />
        <SegmentedTabs
          tabs={[
            { id: ALL, label: "Todos", count: rows.length },
            { id: "Imagem", label: "Imagem", count: rows.filter((row) => row.category === "Imagem").length },
            { id: "Laboratorial", label: "Laboratorial", count: rows.filter((row) => row.category === "Laboratorial").length },
            { id: "Cardiológico", label: "Cardiológico", count: rows.filter((row) => row.category === "Cardiológico").length }
          ]}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <StatePanel
          icon={SearchX}
          title="Nenhum exame encontrado"
          description="Ajuste a busca ou o filtro de categoria."
          action={<Button size="sm" variant="secondary" onClick={() => { setSearch(""); setCategoryFilter(ALL); }}>Limpar filtros</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((exam) => (
            <article
              key={exam.id}
              data-exam-card
              className="flex flex-col rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/75 p-5 shadow-[0_8px_22px_rgba(38,53,50,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-clinical-blue/30 hover:bg-clinical-surface hover:shadow-card dark:shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-clinical-teal/[0.10] text-clinical-teal"><Microscope className="size-5" /></span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-extrabold tracking-tight text-clinical-dark">{exam.name}</h2>
                    <span className={cn("mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold", categoryTone[exam.category])}>{exam.category}</span>
                  </div>
                </div>
                <StatusBadge label={exam.status === "ativo" ? "Ativo" : "Inativo"} tone={exam.status === "ativo" ? "green" : "neutral"} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-clinical-border/[0.10] bg-clinical-surfaceMuted/30 p-3"><dt className="text-[10px] font-extrabold uppercase tracking-wider text-clinical-muted">Preparo</dt><dd className="mt-0.5 text-[12px] font-bold leading-4 text-clinical-dark">{exam.preparation}</dd></div>
                <div className="rounded-2xl border border-clinical-border/[0.10] bg-clinical-surfaceMuted/30 p-3"><dt className="text-[10px] font-extrabold uppercase tracking-wider text-clinical-muted">Duração</dt><dd className="mt-0.5 flex items-center gap-1 text-sm font-extrabold text-clinical-dark"><Clock3 className="size-3.5 text-clinical-blue" />{exam.duration}</dd></div>
              </dl>

              <div className="mt-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-clinical-muted"><UsersRound className="size-3.5" />Profissionais habilitados ({exam.professionalIds.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {exam.professionalIds.length === 0 ? (
                    <span className="text-xs font-semibold text-clinical-muted">Nenhum profissional vinculado.</span>
                  ) : (
                    exam.professionalIds.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-clinical-blue/[0.08] px-2.5 py-1 text-[11px] font-bold text-clinical-blueText"><UserRound className="size-3" />{professionalName(id)}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-clinical-muted"><HeartPulse className="size-3.5" />Convênios que cobrem ({exam.convenioIds.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {exam.convenioIds.length === 0 ? (
                    <span className="text-xs font-semibold text-clinical-muted">Nenhum convênio vinculado.</span>
                  ) : (
                    exam.convenioIds.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-clinical-green/[0.10] px-2.5 py-1 text-[11px] font-bold text-clinical-green"><HeartPulse className="size-3" />{convenioName(id)}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-clinical-border/[0.10] pt-3.5">
                <Button size="sm" className="flex-1" onClick={() => openRelation(exam)}><UsersRound className="size-3.5" />Relacionar</Button>
                <Button size="sm" variant="secondary" onClick={() => openEdit(exam)} aria-label={`Editar ${exam.name}`}><Pencil className="size-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setToDelete(exam)} aria-label={`Remover ${exam.name}`}><X className="size-3.5" /></Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar exame" : "Novo exame"}
        eyebrow="Clínica / Exames"
        description="Cadastre o exame e depois relacione os profissionais habilitados."
        icon={Microscope}
        className="max-w-xl"
      >
        <form onSubmit={submitForm} className="space-y-4">
          <ModalField label="Nome do exame" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Ecocardiograma" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalSelect label="Categoria" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Exam["category"] })}>
              <option>Laboratorial</option><option>Imagem</option><option>Cardiológico</option>
            </ModalSelect>
            <ModalField label="Duração" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Ex.: 40 min" />
          </div>
          <ModalField label="Preparo" value={form.preparation} onChange={(event) => setForm({ ...form, preparation: event.target.value })} placeholder="Ex.: Jejum de 8 horas" />
          <ModalSelect label="Situação" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Exam["status"] })}>
            <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
          </ModalSelect>
          <div>
            <p className="mb-1.5 text-sm font-extrabold text-clinical-dark">Profissionais e convênios</p>
            <SearchField value={formSearch} onChange={setFormSearch} placeholder="Pesquisar profissionais ou convênios…" />
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
              <p className="px-1 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-clinical-muted">Convênios</p>
              {convenios
                .filter((convenio) => convenio.name.toLowerCase().includes(formSearch.toLowerCase()))
                .map((convenio) => {
                  const checked = form.convenioIds.includes(convenio.id);
                  return (
                    <button key={convenio.id} type="button" onClick={() => setForm({ ...form, convenioIds: checked ? form.convenioIds.filter((id) => id !== convenio.id) : [...form.convenioIds, convenio.id] })} aria-pressed={checked} className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-bold transition", checked ? "bg-clinical-green/[0.12] text-clinical-green" : "text-clinical-slate hover:bg-clinical-surface")}>
                      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", checked ? "border-clinical-green bg-clinical-green text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>{checked ? <Check className="size-3.5" /> : null}</span>
                      <span className="truncate">{convenio.name}</span>
                    </button>
                  );
                })}
            </div>
            <p className="mt-1.5 text-xs font-semibold text-clinical-muted">{form.professionalIds.length} profissional(is) · {form.convenioIds.length} convênio(s) selecionados.</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-clinical-border/[0.12] pt-4">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit"><Check className="size-4" />{editing ? "Salvar alterações" : "Cadastrar exame"}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(relation)}
        onClose={() => setRelation(null)}
        title={`Relacionar — ${relation?.name ?? ""}`}
        eyebrow="Clínica / Exames"
        description="Selecione os profissionais habilitados e os convênios que cobrem este exame."
        icon={UsersRound}
        className="max-w-xl"
      >
        <div className="mb-3 flex gap-1 rounded-2xl border border-clinical-border/[0.12] bg-clinical-surfaceMuted/40 p-1">
          <button type="button" onClick={() => setRelationTab("professionals")} aria-pressed={relationTab === "professionals"} className={cn("flex-1 rounded-xl px-3 py-2 text-[13px] font-extrabold transition", relationTab === "professionals" ? "bg-clinical-surface text-clinical-blue shadow-sm" : "text-clinical-muted hover:text-clinical-dark")}>
            Profissionais ({relationIds.length})
          </button>
          <button type="button" onClick={() => setRelationTab("convenios")} aria-pressed={relationTab === "convenios"} className={cn("flex-1 rounded-xl px-3 py-2 text-[13px] font-extrabold transition", relationTab === "convenios" ? "bg-clinical-surface text-clinical-blue shadow-sm" : "text-clinical-muted hover:text-clinical-dark")}>
            Convênios ({relationConvenioIds.length})
          </button>
        </div>
        <SearchField value={relationSearch} onChange={setRelationSearch} placeholder={relationTab === "professionals" ? "Pesquisar profissionais…" : "Pesquisar convênios…"} />
        <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
          {relationTab === "professionals" ? (
            professionals
              .filter((professional) => `${professional.name} ${professional.specialty}`.toLowerCase().includes(relationSearch.toLowerCase()))
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
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-black text-white" style={{ backgroundColor: checked ? professional.avatarColor : "#9AA8A4" }}>
                        {checked ? <Check className="size-4" /> : professional.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold text-clinical-dark">{professional.name}</span>
                        <span className="block truncate text-[11px] font-bold text-clinical-muted">{professional.specialty}</span>
                      </span>
                    </span>
                    <span className={cn("size-5 shrink-0 rounded-md border", checked ? "border-clinical-blue bg-clinical-blue text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>
                      {checked ? <Check className="size-4" /> : null}
                    </span>
                  </button>
                );
              })
          ) : (
            convenios
              .filter((convenio) => convenio.name.toLowerCase().includes(relationSearch.toLowerCase()))
              .map((convenio) => {
                const checked = relationConvenioIds.includes(convenio.id);
                return (
                  <button
                    key={convenio.id}
                    type="button"
                    onClick={() => toggleRelationConvenio(convenio.id)}
                    aria-pressed={checked}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition",
                      checked ? "border-clinical-green/30 bg-clinical-green/[0.08]" : "border-clinical-border/[0.12] bg-clinical-surfaceMuted/30 hover:border-clinical-green/25"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-clinical-dark">{convenio.name}</span>
                      <span className="block truncate text-[11px] font-bold text-clinical-muted">{convenio.ansCode}</span>
                    </span>
                    <span className={cn("size-5 shrink-0 rounded-md border", checked ? "border-clinical-green bg-clinical-green text-white" : "border-clinical-border/[0.20] bg-clinical-surface")}>
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
        title="Remover exame?"
        description={`"${toDelete?.name ?? ""}" será removido do catálogo local.`}
        confirmLabel="Remover"
      />
    </div>
  );
}
