# Prompt — Redesign da seção de Chat (Atendimentos + Chat Interno) Ê-Bot

Use este prompt para aplicar, em outra aplicação derivada da mesma base do **Ê-Bot Clinical** (estado original: composer com botões de anexo/emoji/mic/enviar lado a lado, fundo `.chat-dots` de pontinhos, sem switch de assinatura, sem doodle), todas as alterações de UI feitas na seção de chat. Substitua as cores `clinical-*` / azul pela **paleta do Ê-Bot normal** e ajuste classes Tailwind conforme necessário.

> Stack de referência: Next.js 15 (App Router) + React 19 + Tailwind CSS 3.4 + lucide-react + GSAP. Tokens de cor em CSS custom properties (`--clinical-*` como `R G B`) mapeados no `tailwind.config.ts`.

---

## 1. Composer minimalista e responsivo

**Arquivo:** `src/components/operations/ChatComposer.tsx`

Reescrever o `ChatComposer` (manter `MessageBubble` exportado no mesmo arquivo):

### 1.1 Estrutura da barra (3 zonas)
```
[⋯ (só <lg) | clip + emoji + switch assinatura (só lg+)] [textarea] [mic] [send]
```

### 1.2 Regras
- Botões **menores**: `size-8` (era `size-9`), `rounded-lg`, ícones `size-4` com `strokeWidth={1.75}` (traço fino), cor `text-clinical-muted/85`, hover `hover:bg-clinical-blue/[0.08] hover:text-clinical-blue`.
- Barra: `p-1.5`, `gap-1.5`, `rounded-2xl` (mantém borda/fundo originais).
- **Mic e Send sempre visíveis lado a lado** (mesmo tamanho `size-8`):
  - Mic: ghost (classe dos ícones).
  - Send: preenchido com a cor primária (`bg-clinical-blue text-clinical-charcoal hover:bg-clinical-blueHover`), **sempre habilitado** (sem `disabled`); `submitText` já ignora envio com texto vazio.
  - Ao gravar: o par é substituído por um único botão vermelho de parar/enviar (`bg-red-500`, ícone `Square`).
- **Telas pequenas (`lg:hidden`)**: botão **⋯** (`MoreHorizontal`, `size-4`) que abre popover para cima (`absolute bottom-11 left-0 z-20`, `rounded-2xl border bg-clinical-surface shadow-clinical p-2`, largura `w-56`) contendo:
  - **Assinatura**: linha com `Toggle` (componente `src/components/ui/Toggle.tsx`) + label "Assinatura" + ícone `PenLine`;
  - Divisor;
  - **Anexo** (`Paperclip`) → expande sub-lista: Imagem ou vídeo (`ImageIcon`), Documento (`FileText`), Localização (`MapPin`) — imagem/documento acionam `<input type="file" hidden>`;
  - **Emoji** (`Smile`) → expande grade `grid-cols-6` de emojis.
- **Desktop (`lg+`)**: clip e emoji inline (popovers próprios, `bottom-11`) + **switch de assinatura compacto** inline: ícone `PenLine` + mini track custom (`h-4 w-7`, knob `size-3`), `role="switch"`, verde quando ativo, `title`/`aria-label` "Assinatura da mensagem".
- **Estado de assinatura**: `useState` default `true`; ao enviar texto, incluir flag `withSignature: boolean` no payload `ComposerMessage` (sem anexar texto à mensagem).
- Manter `aria-label` existentes ("Gravar áudio", "Enviar mensagem", "Abrir anexos", "Abrir emojis") e adicionar "Mais opções de mensagem" no ⋯.
- Gravação: timer `useEffect` com `setInterval` + cleanup (`clearInterval`), hint "Toque no botão para enviar" com `hidden sm:inline`.

## 2. Fundo doodle estilo WhatsApp

Não existe biblioteca npm para o wallpaper oficial (asset proprietário da Meta). Gerar tile SVG próprio:

**Arquivo:** `scripts/generate-chat-doodle.mjs` (gerador one-off, rodar com `node`)

- ~30 doodles line-art originais em caixa 24×24 (stroke only, `stroke-linecap="round"`): coração, balão, telefone, cruz, estrela, smile, câmera, sino, música, clipe, avião, lua, sol, nuvem, olho, cadeado, pílula, e-mail, copo, gamepad, folha, chave, bolo, presente, bike, relógio, bola, gato, flor, âncora, fantasma.
- PRNG determinístico (`mulberry32`) para o resultado ser estável.
- Tile **620×620px** com **160 elementos**:
  - ~56 doodles grandes (escala 0.75–1.6 → 18–38px), **posições aleatórias com detecção de colisão** (gap mínimo 14px), rotação ±28°;
  - ~104 preenchedores: mini-doodles (escala 0.35–0.6, rotação ±35°) e **círculos de contorno** (raio 1.5–4.5) — **sem pontos pretos/preenchidos**.
- Saídas: `public/chat-doodle-light.svg` (stroke `#3a5a50`, opacity 0.15) e `public/chat-doodle-dark.svg` (stroke `#cfe3f2`, opacity 0.09). No Ê-Bot normal, trocar os hex pelas cores da paleta local.

**CSS** (`src/app/globals.css`, substituir `.chat-dots`):
```css
.chat-pattern {
  background-color: rgb(var(--clinical-snow) / 0.55);
  background-image: url("/chat-doodle-light.svg");
  background-repeat: repeat;
}
:root[data-theme="dark"] .chat-pattern {
  background-color: rgb(var(--clinical-snow) / 0.35);
  background-image: url("/chat-doodle-dark.svg");
}
```

**Aplicar** trocando `chat-dots` → `chat-pattern` nos containers das listas de mensagens:
- `src/components/operations/AttendancesPage.tsx` (div com `scrollRef`, `clinical-scrollbar`);
- `src/components/operations/ChatsPage.tsx` (div do log de mensagens).

## 3. Bubbles em glassmorphism

**CSS** (`src/app/globals.css`):
```css
.chat-bubble {
  backdrop-filter: blur(10px) saturate(1.15);
  -webkit-backdrop-filter: blur(10px) saturate(1.15);
  box-shadow: 0 2px 10px rgb(var(--clinical-charcoal) / 0.08);
}
:root[data-theme="dark"] .chat-bubble { box-shadow: 0 2px 12px rgb(0 0 0 / 0.35); }
:root[data-theme="dark"] .chat-bubble:not(.chat-bubble-mine):not(.chat-bubble-ai):not(.chat-bubble-human) {
  background-color: rgb(var(--clinical-surface) / 0.72);
  border-color: rgb(var(--clinical-border) / 0.12);
}
```

**Componentes:**
- `AttendanceBubble` (`AttendancesPage.tsx`): adicionar `chat-bubble` na raiz do bubble; variantes: `chat-bubble-mine` (minha msg, mantém `bg-clinical-whatsapp/15`), `chat-bubble-ai`, `chat-bubble-human`; bubble de paciente → `border-white/40 bg-white/60` (tail também `border-b-white/60`). Remover a `shadow-[0_1px_1px...]` antiga.
- `TypingBubble` (`AttendancesPage.tsx`): `chat-bubble` + `border-white/40 bg-white/60`.
- Separador de data ("Hoje"): `rounded-full border border-white/40 bg-white/60 backdrop-blur-md` (era `bg-clinical-surfaceMuted/80`).
- `MessageBubble` (`ChatComposer.tsx`, usado no chat interno): raiz recebe `chat-bubble`; minha mensagem → `chat-bubble-mine bg-clinical-blue/25 text-clinical-dark` (translúcido, não sólido); outra pessoa → `border border-white/40 bg-white/60`.

## 4. Botão de enviar do composer sempre ativo

- Mic e Send visíveis juntos (`size-8`); **Send nunca fica desabilitado** (sem `disabled`), com fundo primário e hover; `submitText` já guarda contra texto vazio.
- **Observação:** um card de "Sugestão da IA" chegou a ser implementado nessa seção e depois **removido por decisão do cliente** — não implemente (sem `AiSuggestion`, sem classe `.chat-ai-suggestion`, sem props `draft`/`onDraftConsumed` no composer).

## 5. Animação "painel de LED" (marquee) no hover de textos truncados

**Novo arquivo:** `src/components/ui/MarqueeText.tsx` — componente `MarqueeText({ text, className, speed = 22 })`:
- `span` wrapper com `overflow-hidden` + `onMouseEnter/onMouseLeave`;
- no hover, mede `scrollWidth - clientWidth`; se transborda, anima com `animation: led-marquee Ns ease-in-out infinite alternate` usando `--marquee-shift` custom property; se cabe, não anima;
- respeita `prefers-reduced-motion`.

**CSS:**
```css
@keyframes led-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-1 * var(--marquee-shift, 0px))); }
}
```

**Onde usar:** texto do gatilho do seletor de unidade no Topbar, header "Unidade ativa" e itens da lista do dropdown (substituindo os `truncate`).

## 6. Card "Central Operacional" (Topbar) compacto + dropdown alinhado

**Arquivo:** `src/components/layout/Topbar.tsx`

- **Card menor**: container `rounded-[18px] px-2.5 py-1.5`, label "Central Operacional" `text-[9px] tracking-[0.14em]`; botão `h-8`, ícone do prédio `size-5`/`size-2.5`, fonte `text-[13px]`, chevron `size-4`/`size-2.5`.
- **Dropdown com a mesma largura do card e extremidades alinhadas**: o `<Popover>` (`src/components/ui/Popover.tsx`, que já suporta `matchTriggerWidth` + `align="left"`) passa a **envolver o card inteiro** — as classes do card vão para `wrapperClassName` do Popover (incluindo `hidden md:block`) e o `matchTriggerWidth` mede o card completo (com padding). Manter `className="p-2"` no painel.
- **Menu com fontes menores**: header "Unidade ativa" `text-[13px]` (label `text-[9px]`), "Trocar unidade" `text-[10px]`, itens `text-xs` com ícone `size-6`/`size-3`, padding `px-2 py-2`, `space-y-0.5`.
- Marquee no hover no texto do gatilho, no header e nos itens.

## 7. Payload de mensagem (assinatura)

- `ComposerMessage` (`ChatComposer.tsx`): adicionar campo opcional `withSignature?: boolean`.
- `submitText` envia `withSignature: signature` (estado do switch). Persistência futura pode ler a flag; bubbles não exibem nada de novo.

## 8. Checklist de verificação

- `npm run lint` e `npm run build` sem erros;
- Testar /atendimentos e /chat-interno em 360px (⋯), 768px (painel dividido, composer estreito → ⋯) e desktop lg+ (clip/emoji/assinatura inline);
- Tema claro e escuro (doodle e glass em ambos);
- Hover em nome de unidade longa → marquee; sem overflow → estático;
- Mic + Send visíveis juntos; gravação substitui o par pelo botão vermelho.
