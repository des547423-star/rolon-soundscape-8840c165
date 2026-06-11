import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { aiChat } from "@/lib/ai-chat.functions";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

export function RolonAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hey 👋 I'm RolonBot AI. Ask me for song ideas, queue help, or commands." },
  ]);
  const chat = useServerFn(aiChat);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => { scroll.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await chat({ data: { messages: next } });
      setMsgs([...next, { role: "assistant", content: r.content }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: `Error: ${e instanceof Error ? e.message : String(e)}` }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-gradient-to-br from-primary to-accent2 shadow-lg shadow-primary/40 grid place-items-center text-primary-foreground hover:scale-105 transition"
        aria-label="Open RolonBot AI"
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[340px] max-w-[calc(100vw-2rem)] h-[460px] rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent2/10">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent2 grid place-items-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-sm">RolonBot AI</div>
              <div className="text-[10px] uppercase tracking-wider text-primary">Smart music assistant</div>
            </div>
          </div>

          <div ref={scroll} className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]"
                    : "bg-muted/60 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%]"
                }>{m.content}</div>
              </div>
            ))}
            {busy && <div className="text-xs text-muted-foreground px-1">RolonBot AI is thinking…</div>}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-3 border-t border-border flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask RolonBot AI…"
              className="flex-1 bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <Button type="submit" size="icon" disabled={busy} className="bg-gradient-to-br from-primary to-accent2 border-0">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
