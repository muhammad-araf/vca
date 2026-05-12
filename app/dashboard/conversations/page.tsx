"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Conversation } from "@/types";
import { MessageSquare, Clock, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

function SentimentIcon({ s }: { s?: string }) {
  if (s === "positive") return <ThumbsUp size={12} className="text-emerald-400" />;
  if (s === "negative") return <ThumbsDown size={12} className="text-red-400" />;
  return <Minus size={12} className="text-zinc-500" />;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.user.id).single();
      if (!biz) { setLoading(false); return; }

      const { data: agents } = await supabase.from("agents").select("id").eq("business_id", biz.id);
      const agentIds = (agents ?? []).map((a) => a.id);

      if (agentIds.length > 0) {
        const { data } = await supabase
          .from("conversations")
          .select("*")
          .in("agent_id", agentIds)
          .order("started_at", { ascending: false });
        setConversations(data ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold tracking-tight">Conversations</h2>
        <p className="text-zinc-500 text-sm mt-1">Review all customer interactions</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 rounded-2xl border border-dashed border-white/[0.08]">
          <MessageSquare size={40} className="text-zinc-700 mb-4" />
          <p className="text-white font-semibold mb-2">No conversations yet</p>
          <p className="text-zinc-500 text-sm">Conversations will appear here once your agents start talking to customers.</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* List */}
          <div className="flex-1 space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === conv.id
                    ? "border-white/20 bg-white/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center">
                      <MessageSquare size={14} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {conv.visitor_id ? `Visitor ${conv.visitor_id.slice(0, 8)}` : "Anonymous"}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(conv.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-zinc-500 text-xs">
                      <Clock size={11} />
                      {conv.duration_secs ? `${Math.floor(conv.duration_secs / 60)}m ${conv.duration_secs % 60}s` : "—"}
                    </div>
                    <SentimentIcon s={conv.sentiment} />
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      conv.outcome === "completed" ? "border-emerald-500/20 text-emerald-400" :
                      conv.outcome === "converted" ? "border-blue-500/20 text-blue-400" :
                      "border-white/[0.06] text-zinc-500"
                    }`}>
                      {conv.outcome ?? "unknown"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Transcript viewer */}
          {selected && (
            <div className="w-72 shrink-0 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] h-fit sticky top-20">
              <h4 className="text-white font-semibold text-sm mb-4">Transcript</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {Array.isArray(selected.transcript) && selected.transcript.length > 0 ? (
                  (selected.transcript as any[]).map((entry: any, i: number) => (
                    <div key={i} className={`text-xs p-2.5 rounded-lg ${
                      entry.role === "user"
                        ? "bg-white/[0.04] text-zinc-300 text-right"
                        : "bg-white/[0.08] text-white"
                    }`}>
                      <span className="block text-zinc-600 text-[10px] mb-1 uppercase">{entry.role}</span>
                      {entry.text}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-600 text-xs">No transcript available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
