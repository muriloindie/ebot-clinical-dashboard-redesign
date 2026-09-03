"use client";

import { useMemo, useState } from "react";
import { Building2, ListOrdered, Pencil, Plus, Power, Trash2, UsersRound } from "lucide-react";
import { deleteSector, listQueues, listSectors, newCompanyId, saveSector } from "@/lib/company/companyService";
import type { Queue, Sector } from "@/lib/company/types";
import { useDemo } from "@/components/state/DemoProvider";
import { Button } from "@/components/ui/Button";
import { ColorField, CLINICAL_PALETTE } from "@/components/ui/ColorField";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { SearchField, PageHeader, SegmentedTabs } from "@/components/ui/Week1Primitives";
import { cn } from "@/lib/cn";

const PALETTE = CLINICAL_PALETTE;

const ALL = "Todos";
type Scope = typeof ALL | "ativos" | "inativos";

function blankSector(): Sector {
  return { id: "", name: "", color: PALETTE[0], description: "", queueIds: [], memberCount: 0, active: true, updatedAt: "agora" };
}

export function SetoresPage() {
  const { toast } = useDemo();
  const [sectors, setSectors] = useState<Sector[]>(() => listSectors());
  const [queues, setQueues] = useState<Queue[]>(() => listQueues());
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>(ALL);
  const [deleting, setDeleting] = useState<Sector | null>(null);
  const [draft, setDraft] = useState<Sector | null>(null);

  function queuesOf(sectorId: string) {
    return queues.filter((queue) => queue.sectorId === sectorId);
  }

  const filtered = useMemo(() => {
    return sectors.filter((sector) => {
      const matchesScope = scope === ALL || (scope === "ativos" ? sector.active : !sector.active);
      const matchesQuery = `${sector.name} ${sector.description}`.toLowerCase().includes(query.toLowerCase());
      return matchesScope && matchesQuery;
    });
  }, [sectors, query, scope]);


  function save() {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast("Informe o nome do setor.", "warning");
      return;
    }
    if (draft.id) {
      saveSector({ ...draft, updatedAt: "agora" });
      toast(`Setor "${draft.name}" atualizado.`);
    } else {
      saveSector({ ...draft, id: newCompanyId("sec"), updatedAt: "agora" });
      toast(`Setor "${draft.name}" criado.`);
    }
    setSectors(listSectors());
    setQueues(listQueues());
    setDraft(null);
  }

  function toggle(sector: Sector) {
    saveSector({ ...sector, active: !sector.active, updatedAt: "agora" });
    setSectors(listSectors());
    toast(sector.active ? `Setor "${sector.name}" desativado.` : `Setor "${sector.name}" ativado.`);
  }

  function remove() {
    if (!deleting) return;
    if (queuesOf(deleting.id).length > 0) {
      toast("Reatribua as filas antes de excluir o setor.", "warning");
      setDeleting(null);
      return;
    }
    deleteSector(deleting.id);
    setSectors(listSectors());
    toast(`Setor "${deleting.name}" excluído.`);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Clínica / Organização"
        title="Setores"
        description="Estrutura da unidade: cada setor agrupa filas de atendimento e define quem opera cada área."
        action={<Button onClick={() => setDraft(blankSector())}><Plus className="size-4" />Novo setor</Button>}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField value={query} onChange={setQuery} placeholder="Buscar setor…" />
        <SegmentedTabs
          tabs={[
            { id: ALL, label: "Todos", count: sectors.length },
            { id: "ativos", label: "Ativos", count: sectors.filter((sector) => sector.active).length },
            { id: "inativos", label: "Inativos", count: sectors.filter((sector) => !sector.active).length }
          ]}
          value={scope}
          onChange={(id) => setScope(id as Scope)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/80 p-10 text-center text-sm font-bold text-clinical-muted">Nenhum setor encontrado.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sector) => (
            <article key={sector.id} className={cn("group rounded-[24px] border bg-clinical-surface/80 p-5 shadow-[0_8px_24px_rgba(38,53,50,0.04)] transition hover:-translate-y-0.5", sector.active ? "border-clinical-border/[0.14]" : "border-clinical-border/[0.08] opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl" style={{ backgroundColor: `${sector.color}22`, color: sector.color }}>
                    <Building2 className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-clinical-dark">{sector.name}</h3>
                    <p className="text-[11px] font-bold text-clinical-muted">{sector.active ? "Setor ativo" : "Setor inativo"}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1">
                  <button onClick={() => setDraft({ ...sector })} title="Editar setor" className="rounded-xl p-2 text-clinical-muted transition hover:bg-clinical-surfaceMuted hover:text-clinical-dark">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => setDeleting(sector)} title="Excluir setor" className="rounded-xl p-2 text-clinical-muted transition hover:bg-clinical-red/10 hover:text-clinical-red">
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>

              <p className="mt-3 text-[12px] font-semibold leading-5 text-clinical-slate">{sector.description}</p>

              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-clinical-muted">
                  <ListOrdered className="size-3.5" />Filas deste setor ({queuesOf(sector.id).length})
                </p>
                {queuesOf(sector.id).length === 0 ? (
                  <p className="rounded-xl border border-dashed border-clinical-border/[0.16] px-3 py-2 text-[12px] font-semibold text-clinical-muted">Nenhuma fila vinculada ainda.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {queuesOf(sector.id).map((queue) => (
                      <span key={queue.id} className="inline-flex items-center gap-1.5 rounded-full bg-clinical-surfaceMuted/70 px-2.5 py-1 text-[11px] font-extrabold text-clinical-slate">
                        <span className="size-2 rounded-full" style={{ backgroundColor: queue.color }} aria-hidden="true" />
                        {queue.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-xl bg-clinical-surfaceMuted/60 px-2.5 py-1 text-[11px] font-extrabold text-clinical-slate">
                  <UsersRound className="size-3.5" />{sector.memberCount} membros
                </span>
              </div>

              <Toggle
                className="mt-4"
                checked={sector.active}
                onChange={() => toggle(sector)}
                statusOn="Ativo"
                statusOff="Inativo"
                icon={Power}
              />
            </article>
          ))}
        </div>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? "Editar setor" : "Novo setor"}>
        {draft && (
          <div className="space-y-4">
            <div>
              <label htmlFor="sec-name" className="mb-1.5 block text-xs font-extrabold text-clinical-slate">Nome do setor</label>
              <input id="sec-name" autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ex.: Cardiologia" className="h-11 w-full rounded-2xl border border-clinical-border/[0.14] bg-clinical-surfaceMuted/45 px-3 text-sm font-semibold text-clinical-dark outline-none focus:border-clinical-blue/45" />
            </div>
            <ColorField label="Cor do setor" value={draft.color} onChange={(color) => setDraft({ ...draft, color })} />
            <div>
              <label htmlFor="sec-desc" className="mb-1.5 block text-xs font-extrabold text-clinical-slate">Descrição</label>
              <textarea id="sec-desc" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="O que este setor atende?" className="w-full rounded-2xl border border-clinical-border/[0.14] bg-clinical-surfaceMuted/45 px-3 py-2.5 text-sm font-semibold text-clinical-dark outline-none focus:border-clinical-blue/45" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
              <Button onClick={save}>{draft.id ? "Salvar alterações" : "Criar setor"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        open={deleting !== null}
        title={`Excluir setor "${deleting?.name ?? ""}"?`}
        description="Esta ação não pode ser desfeita. Setores com filas vinculadas devem ter as filas reatribuídas antes da exclusão."
        confirmLabel="Excluir setor"
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}