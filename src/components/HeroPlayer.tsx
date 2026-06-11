import { Music2, Play, SkipForward, Heart, Volume2 } from "lucide-react";
import { Equalizer } from "./Equalizer";

const QUEUE = [
  { title: "Levitating", artist: "Dua Lipa", len: "3:24" },
  { title: "Peaches", artist: "Justin Bieber", len: "3:18" },
  { title: "Stay", artist: "Kid LAROI, Bieber", len: "2:21" },
  { title: "As It Was", artist: "Harry Styles", len: "2:47" },
];

export function HeroPlayer() {
  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-accent2/30 to-primary/30 blur-3xl opacity-50 pointer-events-none" />
      <div className="relative rounded-2xl border border-white/10 bg-card/70 backdrop-blur-xl shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="grid md:grid-cols-[1fr_280px]">
          {/* Now Playing */}
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
              <Equalizer /> Now playing · #music
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="size-20 rounded-xl bg-gradient-to-br from-primary via-accent2 to-primary grid place-items-center shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse-glow shrink-0">
                <Music2 className="size-8 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-lg truncate">Blinding Lights</div>
                <div className="text-sm text-muted-foreground truncate">The Weeknd · After Hours</div>
              </div>
            </div>

            {/* progress */}
            <div className="mt-5">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[42%] bg-gradient-to-r from-primary to-accent2 rounded-full" />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>1:24</span><span>3:20</span>
              </div>
            </div>

            {/* controls */}
            <div className="mt-3 flex items-center gap-2">
              <button className="size-9 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center"><Heart className="size-4" /></button>
              <button className="size-11 rounded-full bg-gradient-to-br from-primary to-accent2 grid place-items-center text-primary-foreground shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                <Play className="size-5 ml-0.5 fill-current" />
              </button>
              <button className="size-9 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center"><SkipForward className="size-4" /></button>
              <div className="ml-auto flex items-center gap-2 w-32">
                <Volume2 className="size-4 text-muted-foreground" />
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-3/4 bg-white/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Queue */}
          <div className="border-t md:border-t-0 md:border-l border-white/10 bg-black/20 p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Up next</div>
            <div className="space-y-1.5">
              {QUEUE.map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-left">
                  <span className="text-[11px] tabular-nums text-muted-foreground w-4">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{t.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{t.artist}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{t.len}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-2.5 border-t border-white/10 text-[11px] text-muted-foreground bg-black/20">
          Syncs live with Discord voice channels — control from web or chat.
        </div>
      </div>
    </div>
  );
}
