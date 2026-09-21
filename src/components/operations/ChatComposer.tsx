"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileText, Image as ImageIcon, MapPin, Mic, MoreHorizontal, Paperclip, PenLine, Send, Smile, Square } from "lucide-react";
import { cn } from "@/lib/cn";
import { Toggle } from "@/components/ui/Toggle";

export type ComposerMessage = { kind: "text" | "image" | "document" | "audio"; text?: string; fileName?: string; fileSize?: string; duration?: number; withSignature?: boolean };

export function ChatComposer({ onSend, placeholder = "Escreva uma mensagem..." }: { onSend: (message: ComposerMessage) => void; placeholder?: string }) {
  const [value, setValue] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [signature, setSignature] = useState(true);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojis = ["🙂", "👍", "❤️", "👏", "😊", "✅", "✨", "🙏", "😄", "🎉", "🫶", "💙"];

  useEffect(() => {
    if (!recording) return;
    const interval = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, [recording]);

  function submitText(event: React.FormEvent) { event.preventDefault(); if (!value.trim()) return; onSend({ kind: "text", text: value.trim(), withSignature: signature }); setValue(""); setEmojiOpen(false); }
  function toggleRecording() { if (recording) { onSend({ kind: "audio", duration: Math.max(1, seconds) }); setRecording(false); setSeconds(0); } else { setMoreOpen(false); setAttachmentOpen(false); setRecording(true); setSeconds(0); } }
  function chooseFile(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const kind = file.type.startsWith("image/") ? "image" : "document"; onSend({ kind, fileName: file.name, fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB` }); event.target.value = ""; setMoreOpen(false); setAttachmentOpen(false); }
  const formatTime = (time: number) => `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;

  const iconButton = "flex size-8 shrink-0 items-center justify-center rounded-lg text-clinical-muted/85 transition hover:bg-clinical-blue/[0.08] hover:text-clinical-blue";
  const menuItem = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-clinical-slate transition hover:bg-clinical-blue/[0.08] hover:text-clinical-blue";

  return <div className="relative min-w-0 flex-1 border-t border-clinical-border/[0.12] p-3"><div className="flex items-end gap-1.5 rounded-2xl border border-clinical-border/[0.14] bg-clinical-surfaceMuted/45 p-1.5">
    <div className="relative lg:hidden">
      <button type="button" aria-label="Mais opções de mensagem" aria-expanded={moreOpen} onClick={() => { setMoreOpen((current) => !current); setAttachmentOpen(false); setEmojiOpen(false); }} className={cn(iconButton, moreOpen && "bg-clinical-blue/10 text-clinical-blue")}><MoreHorizontal className="size-4" strokeWidth={1.75} /></button>
      {moreOpen ? (
        <div className="absolute bottom-11 left-0 z-20 w-56 rounded-2xl border border-clinical-border/[0.14] bg-clinical-surface p-2 shadow-clinical">
          <Toggle checked={signature} onChange={setSignature} label="Assinatura" icon={PenLine} className="mb-1 border-0 bg-transparent px-2 py-2 hover:bg-clinical-blue/[0.04]" />
          <div className="mx-1 mb-1 h-px bg-clinical-border/[0.12]" />
          <button type="button" aria-label="Abrir anexos" aria-expanded={attachmentOpen} onClick={() => setAttachmentOpen((current) => !current)} className={cn(menuItem, "w-full")}><Paperclip className="size-4 text-clinical-blue" />Anexo (imagem, vídeo, documento)</button>
          <button type="button" aria-label="Abrir emojis" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((current) => !current)} className={cn(menuItem, "w-full")}><Smile className="size-4 text-clinical-teal" />Emoji</button>
          {attachmentOpen ? (
            <div className="mt-1 grid gap-1 rounded-xl bg-clinical-surfaceMuted/40 p-1.5">
              <button type="button" onClick={() => inputRef.current?.click()} className={cn(menuItem, "py-2")}><ImageIcon className="size-4 text-clinical-blue" />Imagem ou vídeo</button>
              <button type="button" onClick={() => inputRef.current?.click()} className={cn(menuItem, "py-2")}><FileText className="size-4 text-clinical-green" />Documento</button>
              <button type="button" onClick={() => { setMoreOpen(false); setAttachmentOpen(false); setValue("Localização da clínica 📍"); }} className={cn(menuItem, "py-2")}><MapPin className="size-4 text-clinical-orange" />Localização</button>
            </div>
          ) : null}
          {emojiOpen ? (
            <div className="mt-1 grid grid-cols-6 gap-1 rounded-xl bg-clinical-surfaceMuted/40 p-1.5">{emojis.map((emoji) => <button type="button" key={emoji} onClick={() => setValue((current) => `${current}${emoji}`)} className="flex size-8 items-center justify-center rounded-lg text-lg hover:bg-clinical-blue/[0.08]">{emoji}</button>)}</div>
          ) : null}
        </div>
      ) : null}
    </div>
    <input ref={inputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={chooseFile} />
    <div className="relative hidden lg:block">
      <button type="button" aria-label="Abrir anexos" aria-expanded={attachmentOpen} onClick={() => { setAttachmentOpen((current) => !current); setEmojiOpen(false); }} className={cn(iconButton, attachmentOpen && "bg-clinical-blue/10 text-clinical-blue")}><Paperclip className="size-4" strokeWidth={1.75} /></button>
      {attachmentOpen ? <div className="absolute bottom-11 left-0 z-20 grid w-48 gap-1 rounded-2xl border border-clinical-border/[0.14] bg-clinical-surface p-2 shadow-clinical"><button type="button" onClick={() => { inputRef.current?.click(); }} className={cn(menuItem, "w-full")}><ImageIcon className="size-4 text-clinical-blue" />Imagem ou vídeo</button><button type="button" onClick={() => inputRef.current?.click()} className={cn(menuItem, "w-full")}><FileText className="size-4 text-clinical-green" />Documento</button><button type="button" onClick={() => { setAttachmentOpen(false); setValue("Localização da clínica 📍"); }} className={cn(menuItem, "w-full")}><MapPin className="size-4 text-clinical-orange" />Localização</button></div> : null}
    </div>
    <div className="relative hidden lg:block">
      <button type="button" aria-label="Abrir emojis" aria-expanded={emojiOpen} onClick={() => { setEmojiOpen((current) => !current); setAttachmentOpen(false); }} className={cn(iconButton, emojiOpen && "bg-clinical-blue/10 text-clinical-blue")}><Smile className="size-4" strokeWidth={1.75} /></button>
      {emojiOpen ? <div className="absolute bottom-11 left-0 z-20 grid w-56 grid-cols-6 gap-1 rounded-2xl border border-clinical-border/[0.14] bg-clinical-surface p-2 shadow-clinical">{emojis.map((emoji) => <button type="button" key={emoji} onClick={() => setValue((current) => `${current}${emoji}`)} className="flex size-8 items-center justify-center rounded-lg text-lg hover:bg-clinical-blue/[0.08]">{emoji}</button>)}</div> : null}
    </div>
    <button type="button" role="switch" aria-checked={signature} aria-label="Assinatura da mensagem" title={signature ? "Assinatura ativada" : "Assinatura desativada"} onClick={() => setSignature((current) => !current)} className={cn("hidden shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition hover:bg-clinical-blue/[0.08] lg:flex", signature ? "text-clinical-green" : "text-clinical-muted/85")}>
      <PenLine className="size-4" strokeWidth={1.75} />
      <span aria-hidden="true" className={cn("relative h-4 w-7 rounded-full transition-colors duration-200", signature ? "bg-clinical-green" : "bg-clinical-surfaceMuted")}><span className={cn("absolute top-0.5 size-3 rounded-full bg-white shadow transition-all duration-200", signature ? "left-[14px]" : "left-0.5")} /></span>
    </button>
    {recording ? <div className="flex min-w-0 flex-1 items-center gap-3 px-2"><span className="size-2 animate-pulse rounded-full bg-red-500" /><span className="text-sm font-extrabold text-red-500">Gravando {formatTime(seconds)}</span><span className="hidden text-xs font-semibold text-clinical-muted sm:inline">Toque no botão para enviar</span></div> : <textarea ref={textareaRef} value={value} onChange={(event) => setValue(event.target.value)} rows={1} placeholder={placeholder} className="min-w-0 max-h-24 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm font-medium text-clinical-dark outline-none" />}
    {recording ? <button type="button" onClick={toggleRecording} aria-label="Parar e enviar áudio" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white transition hover:bg-red-600"><Square className="size-3.5" /></button> : <><button type="button" onClick={toggleRecording} aria-label="Gravar áudio" className={cn(iconButton, "hover:bg-clinical-blue/10")}><Mic className="size-4" strokeWidth={1.75} /></button><button type="submit" form="chat-composer-form" aria-label="Enviar mensagem" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-clinical-blue text-clinical-charcoal shadow-sm transition hover:bg-clinical-blueHover"><Send className="size-4" strokeWidth={1.75} /></button></>}
  </div><form id="chat-composer-form" onSubmit={submitText} className="hidden" /></div>;
}

export function MessageBubble({ message, mine, playing, onPlay }: { message: ComposerMessage & { time: string; status?: "sent" | "delivered" | "read" }; mine: boolean; playing: boolean; onPlay: () => void }) {
  const status = message.status === "read" ? <span className="inline-flex"><span className="-mr-1"><Check className="size-3" /></span><Check className="size-3" /></span> : message.status === "delivered" ? <span className="inline-flex"><span className="-mr-1"><Check className="size-3" /></span><Check className="size-3" /></span> : <Check className="size-3" />;
  return <div className={cn("chat-bubble max-w-[82%] rounded-2xl p-3 text-sm leading-6", mine ? "chat-bubble-mine rounded-tr-md bg-clinical-blue/25 text-clinical-dark" : "rounded-tl-md border border-white/40 bg-white/60 text-clinical-slate")}><div className="flex items-start gap-3">{message.kind === "audio" ? <button type="button" onClick={onPlay} aria-label={playing ? "Pausar áudio" : "Ouvir áudio"} className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", mine ? "bg-clinical-charcoal/15" : "bg-clinical-blue/10 text-clinical-blue")}>{playing ? <Square className="size-3" /> : <Mic className="size-4" />}</button> : null}<div className="min-w-0 flex-1">{message.kind === "text" ? <p>{message.text}</p> : message.kind === "audio" ? <><div className="flex h-6 items-center gap-1"><span className="h-2 w-1 rounded-full bg-current opacity-50" /><span className="h-4 w-1 rounded-full bg-current opacity-70" /><span className="h-6 w-1 rounded-full bg-current" /><span className="h-3 w-1 rounded-full bg-current opacity-60" /><span className="h-5 w-1 rounded-full bg-current opacity-75" /><span className="h-2 w-1 rounded-full bg-current opacity-45" /><span className="ml-2 h-1 flex-1 rounded-full bg-current opacity-25" /></div><span className="text-[11px] font-bold opacity-65">Áudio local · 00:{String(message.duration ?? 1).padStart(2, "0")}</span></> : <div className="flex items-center gap-2 rounded-xl bg-black/[0.06] p-2"><span className="flex size-8 items-center justify-center rounded-lg bg-clinical-blue/10">{message.kind === "image" ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}</span><span className="min-w-0"><span className="block truncate text-xs font-extrabold">{message.fileName}</span><span className="block text-[10px] opacity-65">{message.fileSize}</span></span></div>}<span className="mt-1 flex items-center justify-end gap-1 text-[10px] font-semibold opacity-65">{message.time}{mine ? status : null}</span></div></div></div>;
}
