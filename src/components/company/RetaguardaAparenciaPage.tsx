"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, LayoutPanelLeft, Palette, Save, Sparkles, X } from "lucide-react";
import { getAppearance, saveAppearance } from "@/lib/system/systemService";
import type { AppearanceSettings } from "@/data/systemMock";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { PageHeader } from "@/components/ui/Week1Primitives";
import { usePageEnter } from "@/lib/usePageEnter";
import { cn } from "@/lib/cn";

const ACCENTS: { id: AppearanceSettings["accent"]; color: string }[] = [
  { id: "Azul clínico", color: "#3A9DCA" },
  { id: "Verde clínico", color: "#4CB782" },
  { id: "Violeta", color: "#8E6FBD" },
  { id: "Laranja", color: "#F2A34D" }
];

export function RetaguardaAparenciaPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);
  const [notice, setNotice] = useState("");

  usePageEnter(pageRef, [
    { selector: "[data-appearance-card]", from: { opacity: 0, y: 18 } }
  ], { stagger: 0.07, delay: 0.05 });

  useEffect(() => setSettings(getAppearance()), []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function update(patch: Partial<AppearanceSettings>) {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
  }

  function save() {
    if (!settings) return;
    saveAppearance(settings);
    showNotice("Preferências de aparência salvas (demo local).");
  }

  if (!settings) return null;

  return (
    <div ref={pageRef} className="space-y-4">
      <PageHeader
        eyebrow="Retaguarda / Personalização"
        title="Aparência"
        description="Ajuste a identidade visual da plataforma para esta clínica: logo, estilo da barra lateral, cor de destaque e densidade."
        action={<Button onClick={save}><Save className="size-4" />Salvar aparência</Button>}
      />

      {notice ? (
        <div role="status" className="flex items-center justify-between rounded-2xl border border-clinical-green/20 bg-clinical-green/[0.08] px-4 py-3 text-sm font-bold text-clinical-green">
          <span className="flex items-center gap-2"><Check className="size-4" />{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Fechar aviso"><X className="size-4" /></button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section data-appearance-card className="rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/80 p-5 shadow-[0_8px_22px_rgba(38,53,50,0.04)]">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-clinical-dark"><Sparkles className="size-4 text-clinical-blue" />Identidade</h2>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-extrabold text-clinical-dark">Nome exibido no logo</span>
            <input
              value={settings.logoText}
              onChange={(event) => update({ logoText: event.target.value })}
              className="h-11 w-full rounded-2xl border border-clinical-border/[0.14] bg-clinical-surfaceMuted/45 px-3 text-sm font-semibold text-clinical-dark outline-none focus:border-clinical-blue/45 focus:ring-2 focus:ring-clinical-blue/10"
            />
          </label>
          <p className="mt-4 mb-2 text-sm font-extrabold text-clinical-dark">Cor de destaque</p>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((accent) => (
              <button
                key={accent.id}
                type="button"
                onClick={() => update({ accent: accent.id })}
                aria-pressed={settings.accent === accent.id}
                className={cn("flex items-center gap-2 rounded-2xl border px-3 py-2 text-[12px] font-extrabold transition", settings.accent === accent.id ? "border-clinical-blue/40 bg-clinical-blue/[0.06] text-clinical-dark" : "border-clinical-border/[0.14] bg-clinical-surfaceMuted/30 text-clinical-muted hover:border-clinical-blue/25")}
              >
                <span className="size-4 rounded-full" style={{ backgroundColor: accent.color }} />
                {accent.id}
              </button>
            ))}
          </div>
          <div className="mt-5">
            <Toggle checked={settings.showBadges} onChange={(value) => update({ showBadges: value })} label="Exibir badges nos menus" hint="Contadores de itens, como não lidos e filas" icon={Eye} />
          </div>
        </section>

        <section data-appearance-card className="rounded-[24px] border border-clinical-border/[0.14] bg-clinical-surface/80 p-5 shadow-[0_8px_22px_rgba(38,53,50,0.04)]">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-clinical-dark"><LayoutPanelLeft className="size-4 text-clinical-blue" />Layout</h2>
          <p className="mt-4 mb-2 text-sm font-extrabold text-clinical-dark">Estilo da barra lateral</p>
          <div className="grid grid-cols-2 gap-2">
            {(["claro", "escuro"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => update({ sidebarStyle: style })}
                aria-pressed={settings.sidebarStyle === style}
                className={cn(
                  "flex h-24 flex-col justify-between rounded-2xl border p-3 text-left transition",
                  settings.sidebarStyle === style ? "border-clinical-blue/45 ring-2 ring-clinical-blue/15" : "border-clinical-border/[0.14] hover:border-clinical-blue/25"
                )}
              >
                <span className="flex gap-1.5">
                  <span className={cn("h-14 w-4 rounded-lg", style === "claro" ? "bg-clinical-surfaceMuted" : "bg-clinical-charcoal")} />
                  <span className="flex-1 space-y-1">
                    <span className={cn("block h-2 w-3/4 rounded-full", style === "claro" ? "bg-clinical-surfaceMuted" : "bg-white/25")} />
                    <span className={cn("block h-2 w-1/2 rounded-full", style === "claro" ? "bg-clinical-surfaceMuted" : "bg-white/25")} />
                    <span className={cn("block h-2 w-2/3 rounded-full", style === "claro" ? "bg-clinical-blue/30" : "bg-clinical-blue/60")} />
                  </span>
                </span>
                <span className="text-[12px] font-extrabold capitalize text-clinical-dark">{style}</span>
              </button>
            ))}
          </div>
          <p className="mt-5 mb-2 text-sm font-extrabold text-clinical-dark">Densidade</p>
          <div className="flex gap-2">
            {(["Confortável", "Compacta"] as const).map((density) => (
              <button
                key={density}
                type="button"
                onClick={() => update({ density })}
                aria-pressed={settings.density === density}
                className={cn("rounded-2xl border px-4 py-2 text-[12px] font-extrabold transition", settings.density === density ? "border-clinical-blue/40 bg-clinical-blue/[0.06] text-clinical-dark" : "border-clinical-border/[0.14] bg-clinical-surfaceMuted/30 text-clinical-muted hover:border-clinical-blue/25")}
              >
                {density}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            <Toggle checked={settings.roundedCorners} onChange={(value) => update({ roundedCorners: value })} label="Cantos arredondados" hint="Estilo suave nos cartões e janelas" icon={Palette} />
            <Toggle checked={settings.animations} onChange={(value) => update({ animations: value })} label="Animações de entrada" hint="Transições das telas e cartões" icon={Sparkles} />
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <Button onClick={save}><Check className="size-4" />Salvar aparência</Button>
      </div>
    </div>
  );
}
