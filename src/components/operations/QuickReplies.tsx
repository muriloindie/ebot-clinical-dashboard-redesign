"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/cn";

const defaultReplies = [
  "Posso ajudar em mais alguma coisa?",
  "Vou verificar e já te retorno em instantes.",
  "Segue o endereço e horário de funcionamento da unidade.",
  "Seu horário está confirmado. Até lá!"
];

export function QuickReplies({
  open,
  onPick,
  options = defaultReplies
}: {
  open: boolean;
  onPick: (text: string) => void;
  options?: string[];
}) {
  if (!open) return null;
  return (
    <div className="absolute bottom-full left-3 right-3 z-20 mb-2 rounded-2xl border border-clinical-border/[0.14] bg-clinical-surface p-2 shadow-clinical backdrop-blur-xl">
      <div className="mb-1.5 flex items-center gap-2 px-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-clinical-muted">
        <Zap className="size-3.5 text-clinical-orange" /> Respostas rápidas
      </div>
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onPick(option)}
            className={cn(
              "rounded-xl px-3 py-2 text-left text-[13px] font-semibold leading-5 text-clinical-slate transition",
              "hover:bg-clinical-blue/[0.08] hover:text-clinical-blueText"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
