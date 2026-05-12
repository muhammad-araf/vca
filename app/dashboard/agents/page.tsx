"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Agent, VOICES, LANGUAGES, PERSONALITY_PRESETS } from "@/types";
import { Bot, Plus, Trash2, Edit3, X, Check, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-[3rem] border border-white bg-white p-10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-slate-900 text-2xl font-black tracking-tight">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Your AI Employees</h2>
          <p className="text-slate-400 font-bold uppercase tracking-tight text-xs">Create and manage your voice agents across businesses.</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="h-16 px-10 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-black/10 bg-black text-white hover:bg-slate-900"
        >
          <Plus size={20} className="mr-3" />
          Deploy New Agent
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-[3rem] bg-white/40 border border-slate-100 animate-pulse" />)}
        </div>
      ) : agents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-40 rounded-[4rem] bg-white/40 border border-dashed border-slate-200 backdrop-blur-md"
        >
          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner">
            <Bot size={48} className="text-slate-300" />
          </div>
          <p className="text-slate-900 text-2xl font-black tracking-tight mb-3">No Agents Deployed</p>
          <p className="text-slate-400 font-bold text-center max-w-xs mb-10 leading-relaxed uppercase tracking-tight text-xs">
            Create your first AI voice employee and start handling calls in minutes.
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-16 px-10 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-black/10"
          >
            <Plus size={18} className="mr-2" /> Create First Agent
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, i) => (
            <motion.div 
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <Card className="p-8 border-none bg-white/70 backdrop-blur-xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 rounded-[3.5rem] relative overflow-hidden h-full flex flex-col">
                <div className="absolute inset-0 bg-vocalink-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-black/20 group-hover:scale-110 transition-transform duration-500">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-black text-lg tracking-tight leading-none mb-2">{agent.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" className="px-3 py-1 rounded-full text-[8px] border-none bg-slate-100 text-slate-500">{agent.voice_name}</Badge>
                        <Badge variant="info" className="px-3 py-1 rounded-full text-[8px] border-none bg-slate-100 text-slate-500">{agent.language}</Badge>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleActive(agent)} 
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    {agent.is_active 
                      ? <ToggleRight size={24} className="text-emerald-500" /> 
                      : <ToggleLeft size={24} className="text-slate-300" />
                    }
                  </button>
                </div>

                <div className="space-y-6 flex-grow relative z-10">
                  <p className="text-slate-400 text-xs font-bold leading-relaxed line-clamp-3 uppercase tracking-tight">
                    {agent.system_prompt || "Defining the core personality and logic of your AI employee."}
                  </p>

                  <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Calls</span>
                      <span className="text-lg font-black text-slate-900 tracking-tighter">{agent.total_conversations}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${agent.is_active ? "text-emerald-500" : "text-slate-300"}`}>
                        {agent.is_active ? "Live & Ready" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-10 relative z-10">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex-1"
                  >
                    <Button className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/5 hover:scale-[1.02] transition-all">
                      <Edit3 size={14} className="mr-2" /> Configure
                    </Button>
                  </Link>
                  <button
                    onClick={() => setDeleteId(agent.id)}
                    className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Deploy New AI Employee">
        <div className="flex flex-col gap-6">
          <div className="space-y-6">
            {[
              { label: "Agent Name", key: "name", placeholder: "e.g. Sana", type: "text" },
              { label: "Business Sector", key: "business_type", placeholder: "e.g. Fine Dining, Logistics", type: "text" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2.5 ml-1">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all shadow-sm"
                />
              </div>
            ))}

            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2.5 ml-1">Voice Profile</label>
              <select
                value={form.voice_name}
                onChange={(e) => setForm({ ...form, voice_name: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 text-sm font-bold outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all shadow-sm appearance-none"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>{v.label} ({v.gender})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2.5 ml-1">Native Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 text-sm font-bold outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all shadow-sm appearance-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={createAgent}
            disabled={saving || !form.name.trim()}
            className="w-full h-16 rounded-2xl shadow-2xl shadow-black/10 mt-4 text-sm font-black uppercase tracking-widest"
          >
            {saving ? "Deploying..." : "Finalize Deployment"}
          </Button>
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
