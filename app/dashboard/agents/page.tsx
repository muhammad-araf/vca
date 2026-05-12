"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Agent, VOICES, LANGUAGES, PERSONALITY_PRESETS } from "@/types";
import { Bot, Plus, Trash2, Edit3, X, Check, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0a0a] p-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [bizId, setBizId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    voice_name: "Zephyr",
    language: "en",
    personality: "professional",
    business_type: "",
    system_prompt: "",
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: biz } = await supabase
        .from("businesses").select("id").eq("user_id", user.user.id).single();

      if (!biz) { setLoading(false); return; }
      setBizId(biz.id);

      const { data } = await supabase.from("agents").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      setAgents(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const createAgent = async () => {
    if (!bizId || !form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("agents").insert({
      business_id: bizId,
      ...form,
      system_prompt: form.system_prompt || `You are ${form.name}, a ${form.personality} AI voice assistant for a ${form.business_type || "business"}. Help customers naturally and efficiently.`,
    }).select().single();

    if (data) {
      setAgents((prev) => [data, ...prev]);
      setModalOpen(false);
      setForm({ name: "", voice_name: "Zephyr", language: "en", personality: "professional", business_type: "", system_prompt: "" });
    }
    setSaving(false);
  };

  const deleteAgent = async (id: string) => {
    const supabase = createClient();
    await supabase.from("agents").delete().eq("id", id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setDeleteId(null);
  };

  const toggleActive = async (agent: Agent) => {
    const supabase = createClient();
    await supabase.from("agents").update({ is_active: !agent.is_active }).eq("id", agent.id);
    setAgents((prev) => prev.map((a) => a.id === agent.id ? { ...a, is_active: !a.is_active } : a));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-2xl font-bold tracking-tight">Agents</h2>
          <p className="text-zinc-500 text-sm mt-1">Create and manage your AI voice employees</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-4 py-2 rounded-xl hover:bg-zinc-100 transition-all"
        >
          <Plus size={15} />
          New Agent
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />)}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 rounded-2xl border border-dashed border-white/[0.08]">
          <Bot size={40} className="text-zinc-700 mb-4" />
          <p className="text-white font-semibold mb-2">No agents yet</p>
          <p className="text-zinc-500 text-sm mb-6 text-center max-w-xs">
            Create your first AI voice agent and deploy it on your website in minutes.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-4 py-2 rounded-xl"
          >
            <Plus size={14} /> Create Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center text-white font-bold text-base">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{agent.name}</p>
                    <p className="text-zinc-500 text-xs">{agent.voice_name} · {agent.language}</p>
                  </div>
                </div>
                <button onClick={() => toggleActive(agent)} className="text-zinc-500 hover:text-white transition-colors">
                  {agent.is_active ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                </button>
              </div>

              <p className="text-zinc-600 text-xs mb-4 line-clamp-2">
                {agent.system_prompt || "No prompt configured yet."}
              </p>

              <div className="flex items-center gap-2 text-xs text-zinc-600 mb-4">
                <span>{agent.total_conversations} calls</span>
                <span>·</span>
                <span className={agent.is_active ? "text-emerald-400" : "text-zinc-600"}>
                  {agent.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/[0.08] text-white text-xs font-medium hover:bg-white/[0.04] transition-all"
                >
                  <Edit3 size={12} /> Configure
                </Link>
                <button
                  onClick={() => setDeleteId(agent.id)}
                  className="p-2 rounded-lg border border-white/[0.08] text-zinc-600 hover:text-red-400 hover:border-red-500/20 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Agent">
        <div className="flex flex-col gap-4">
          {[
            { label: "Agent Name", key: "name", placeholder: "e.g. Sana", type: "text" },
            { label: "Business Type", key: "business_type", placeholder: "e.g. Restaurant, Healthcare", type: "text" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-white/20 transition-all"
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Voice</label>
            <select
              value={form.voice_name}
              onChange={(e) => setForm({ ...form, voice_name: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/20 transition-all"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id} className="bg-zinc-900">{v.label} ({v.gender}) — {v.description}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/20 transition-all"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} className="bg-zinc-900">{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Personality</label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, personality: p })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    form.personality === p
                      ? "bg-white text-black"
                      : "border border-white/[0.08] text-zinc-400 hover:border-white/[0.16]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createAgent}
            disabled={saving || !form.name.trim()}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-all text-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {saving ? "Creating..." : <><Check size={14} /> Create Agent</>}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Agent">
        <p className="text-zinc-400 text-sm mb-6">This will permanently delete the agent and all its conversations. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-zinc-400 text-sm hover:bg-white/[0.04] transition-all">
            Cancel
          </button>
          <button
            onClick={() => deleteId && deleteAgent(deleteId)}
            className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-all"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
