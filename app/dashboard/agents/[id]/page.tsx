"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Agent, KnowledgeBase, VOICES, LANGUAGES, PERSONALITY_PRESETS } from "@/types";
import {
  Save, Trash2, Play, Square, Mic, MicOff, Plus, X,
  Copy, Check, ChevronLeft, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { AGENT_CONFIG } from "@/app/config/agent";

// ─── Mini Waveform ───
function MiniWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-white waveform-bar"
          style={{
            height: active ? `${20 + Math.random() * 80}%` : "20%",
            transition: `height ${0.1 + i * 0.03}s ease`,
            opacity: 0.4 + i / 20,
          }}
        />
      ))}
    </div>
  );
}

export default function AgentConfigPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [voiceName, setVoiceName] = useState("Zephyr");
  const [language, setLanguage] = useState("en");
  const [personality, setPersonality] = useState("professional");
  const [businessType, setBusinessType] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  // Knowledge add
  const [newKbType, setNewKbType] = useState<"text" | "url" | "faq">("text");
  const [newKbTitle, setNewKbTitle] = useState("");
  const [newKbContent, setNewKbContent] = useState("");
  const [addingKb, setAddingKb] = useState(false);

  // Voice test
  const [testing, setTesting] = useState(false);
  const [testState, setTestState] = useState<"idle" | "connecting" | "listening" | "speaking">("idle");
  const [wsRef, setWsRef] = useState<WebSocket | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: agentData } = await supabase.from("agents").select("*").eq("id", id).single();
      if (!agentData) { router.push("/dashboard/agents"); return; }

      setAgent(agentData);
      setName(agentData.name);
      setVoiceName(agentData.voice_name);
      setLanguage(agentData.language);
      setPersonality(agentData.personality);
      setBusinessType(agentData.business_type ?? "");
      setSystemPrompt(agentData.system_prompt);

      const { data: kbData } = await supabase.from("knowledge_base").select("*").eq("agent_id", id);
      setKnowledge(kbData ?? []);
      setLoading(false);
    };
    load();
  }, [id, router]);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("agents").update({
      name, voice_name: voiceName, language, personality, business_type: businessType, system_prompt: systemPrompt,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addKnowledge = async () => {
    if (!newKbContent.trim()) return;
    setAddingKb(true);
    const supabase = createClient();
    const { data } = await supabase.from("knowledge_base").insert({
      agent_id: id, type: newKbType, title: newKbTitle, content: newKbContent,
    }).select().single();
    if (data) setKnowledge((prev) => [...prev, data]);
    setNewKbTitle("");
    setNewKbContent("");
    setAddingKb(false);
  };

  const removeKb = async (kbId: string) => {
    const supabase = createClient();
    await supabase.from("knowledge_base").delete().eq("id", kbId);
    setKnowledge((prev) => prev.filter((k) => k.id !== kbId));
  };

  const copyWidgetCode = () => {
    const code = `<script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget.js" data-agent="${agent?.widget_key}"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const autoPrompt = () => {
    setSystemPrompt(
      `You are ${name || "an AI assistant"}, a ${personality} voice assistant for a ${businessType || "business"}. ` +
      `You speak ${language === "hinglish" ? "Hinglish (mix of Urdu and English)" : language === "ur" ? "Urdu" : "English"} naturally. ` +
      `Help customers warmly and efficiently. Keep responses concise and conversational.`
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />)}
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agents" className="text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-white text-xl font-bold">{agent.name}</h2>
            <p className="text-zinc-500 text-sm">{agent.voice_name} · {agent.language}</p>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-4 py-2 rounded-xl hover:bg-zinc-100 transition-all disabled:opacity-50"
        >
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> {saving ? "Saving..." : "Save"}</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-white font-semibold text-sm mb-5">Agent Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Business Type</label>
                <input
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. Restaurant"
                  className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Voice</label>
                <select
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/20 transition-all"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id} className="bg-zinc-900">{v.label} — {v.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/20 transition-all"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id} className="bg-zinc-900">{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Personality</label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPersonality(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      personality === p ? "bg-white text-black" : "border border-white/[0.08] text-zinc-400 hover:border-white/[0.16]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">System Prompt</h3>
              <button
                onClick={autoPrompt}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
              >
                <RotateCcw size={12} /> Auto-generate
              </button>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={10}
              placeholder="Define how your agent behaves, speaks, and responds..."
              className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/20 transition-all resize-none placeholder:text-zinc-700 font-mono leading-relaxed"
            />
            <p className="text-zinc-700 text-xs mt-2">{systemPrompt.length} characters</p>
          </div>

          {/* Knowledge Base */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-white font-semibold text-sm mb-5">Knowledge Base</h3>

            {/* Existing entries */}
            {knowledge.length > 0 && (
              <div className="space-y-2 mb-5">
                {knowledge.map((kb) => (
                  <div key={kb.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/[0.08] text-zinc-400">{kb.type}</span>
                        {kb.title && <span className="text-xs text-white font-medium truncate">{kb.title}</span>}
                      </div>
                      <p className="text-zinc-500 text-xs line-clamp-2">{kb.content}</p>
                    </div>
                    <button
                      onClick={() => removeKb(kb.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add entry */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex gap-2 mb-3">
                {(["text", "url", "faq"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewKbType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                      newKbType === t ? "bg-white text-black" : "border border-white/[0.08] text-zinc-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                value={newKbTitle}
                onChange={(e) => setNewKbTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/20 transition-all placeholder:text-zinc-700 mb-3"
              />
              <textarea
                value={newKbContent}
                onChange={(e) => setNewKbContent(e.target.value)}
                placeholder={newKbType === "url" ? "https://..." : "Paste your content here..."}
                rows={3}
                className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-white/20 transition-all placeholder:text-zinc-700 resize-none"
              />
              <button
                onClick={addKnowledge}
                disabled={addingKb || !newKbContent.trim()}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.08] text-white text-sm hover:bg-white/[0.04] transition-all disabled:opacity-50"
              >
                <Plus size={14} /> {addingKb ? "Adding..." : "Add Entry"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Test + Embed */}
        <div className="space-y-5">
          {/* Voice Test */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-white font-semibold text-sm mb-4">Live Test</h3>
            <p className="text-zinc-500 text-xs mb-6">Test your agent&apos;s voice and responses before going live.</p>

            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center text-white font-bold text-2xl">
                {name.charAt(0) || "?"}
              </div>

              <div className="h-8 w-full flex justify-center">
                <MiniWave active={testState === "speaking" || testState === "listening"} />
              </div>

              <p className="text-xs text-zinc-600 text-center">
                {testState === "idle" && "Click to start a test conversation"}
                {testState === "connecting" && "Connecting..."}
                {testState === "listening" && "Listening..."}
                {testState === "speaking" && "Speaking..."}
              </p>

              <Link
                href="/kababjees"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition-all"
              >
                <Play size={14} /> Open Voice Demo
              </Link>
            </div>
          </div>

          {/* Widget Embed */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-white font-semibold text-sm mb-4">Embed Widget</h3>
            <p className="text-zinc-500 text-xs mb-4">Add this script to your website to embed the voice widget.</p>
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/[0.08] mb-4 group relative">
              <code className="text-emerald-400 text-[10px] break-all font-mono leading-relaxed block pr-8">
                {`<script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget.js"\ndata-agent="${agent.widget_key}"></script>`}
              </code>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Check className="text-emerald-500" size={14} />
              </div>
            </div>
            <button
              onClick={copyWidgetCode}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.08] text-white text-sm hover:bg-white/[0.04] transition-all"
            >
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Code</>}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-white font-semibold text-sm mb-4">Agent Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Total Calls", val: agent.total_conversations },
                { label: "Status", val: agent.is_active ? "Active" : "Inactive" },
                { label: "Knowledge entries", val: knowledge.length },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-zinc-500 text-xs">{s.label}</span>
                  <span className="text-white text-xs font-medium">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
