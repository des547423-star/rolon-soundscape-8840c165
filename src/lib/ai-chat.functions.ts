import { createServerFn } from "@tanstack/react-start";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM = `You are RolonBot AI — a concise, slightly Gen-Z Discord music assistant.
You help users pick songs, fix queue issues, recommend playlists, and explain RolonBot slash commands
(/play /pause /skip /queue /loop /shuffle /volume /bassboost /nightcore /lofi /247).
Keep replies under 3 short sentences. Use one tasteful emoji max.`;

export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: Msg[] }) => {
    if (!Array.isArray(d?.messages)) throw new Error("messages required");
    return { messages: d.messages.slice(-12) };
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { content: "AI is offline (missing LOVABLE_API_KEY)." };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, ...data.messages],
      }),
    });
    if (r.status === 429) return { content: "Rate limited — try again in a moment." };
    if (r.status === 402) return { content: "AI credits exhausted. Add credits to keep chatting." };
    if (!r.ok) return { content: `AI error (${r.status}).` };
    const j = await r.json();
    return { content: j.choices?.[0]?.message?.content ?? "…" };
  });
