"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Volume2, 
  Shield, Bell, Zap, Save, ChevronRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { createClient } from "@/lib/supabase/client";

export default function Settings() {
  const [config, setConfig] = useState({
    agentName: 'VocaLink Assistant',
    agentVoice: 'Female Urdu Voice',
    agentTone: 'Professional',
    defaultLanguage: 'Urdu + Roman Urdu + English',
    handoffRule: 'When confidence < 70%',
    notifications: true,
  });

  const [agentId, setAgentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
      
      if (business) {
        const { data: agent } = await supabase.from('agents').select('*').eq('business_id', business.id).single();
        if (agent) {
          setAgentId(agent.id);
          setConfig({
            agentName: agent.name || 'VocaLink Assistant',
            agentVoice: agent.voice_name || 'Female Urdu Voice',
            agentTone: agent.personality || 'Professional',
            defaultLanguage: agent.language || 'Urdu + Roman Urdu + English',
            handoffRule: 'When confidence < 70%', // mock for now, can add to DB later
            notifications: true,
          });
        }
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    if (agentId) {
      const supabase = createClient();
      await supabase.from('agents').update({
        name: config.agentName,
        voice_name: config.agentVoice,
        personality: config.agentTone,
        language: config.defaultLanguage,
      }).eq('id', agentId);
    }
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Platform Settings</h2>
        <p className="text-slate-400 font-medium">Manage your account, security, and AI agent preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {[
            { label: 'Agent Personality', icon: <Volume2 size={18} />, active: true },
            { label: 'Account Settings', icon: <User size={18} />, active: false },
            { label: 'Security & Auth', icon: <Shield size={18} />, active: false },
            { label: 'Notifications', icon: <Bell size={18} />, active: false },
            { label: 'Billing & Plans', icon: <Zap size={18} />, active: false },
          ].map((item, i) => (
            <button 
              key={i}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                item.active ? 'bg-black text-white shadow-xl' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {item.active && <ChevronRight size={14} className="text-white" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-8">
          <Card className="p-8 border-none bg-white card-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <Volume2 size={20} className="text-slate-900" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Agent Personality</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Agent Identity Name</label>
                <input 
                  type="text" 
                  value={config.agentName}
                  onChange={(e) => setConfig({...config, agentName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Select Voice Profile</label>
                <select 
                  value={config.agentVoice}
                  onChange={(e) => setConfig({...config, agentVoice: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 appearance-none outline-none"
                >
                  <option>Male Urdu Voice</option>
                  <option>Female Urdu Voice</option>
                  <option>English Voice</option>
                  <option>Bilingual Voice</option>
                  <option>Zephyr</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Communication Tone</label>
                <select 
                  value={config.agentTone}
                  onChange={(e) => setConfig({...config, agentTone: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 appearance-none outline-none"
                >
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Formal</option>
                  <option>Desi Casual</option>
                  <option>friendly</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Human Handoff Trigger</label>
                <select 
                  value={config.handoffRule}
                  onChange={(e) => setConfig({...config, handoffRule: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 appearance-none outline-none"
                >
                  <option>When confidence &lt; 70%</option>
                  <option>When confidence &lt; 85%</option>
                  <option>On direct human request</option>
                  <option>Never (Pure AI)</option>
                </select>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Email & Push Notifications</p>
                <p className="text-xs text-slate-400 mt-1 font-bold">Receive alerts for new orders and missed calls.</p>
              </div>
              <button 
                onClick={() => setConfig({...config, notifications: !config.notifications})}
                className={`w-12 h-6 rounded-full transition-all duration-500 relative ${config.notifications ? 'bg-black shadow-lg shadow-black/20' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 ${config.notifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </Card>

          <Card className="p-8 border-2 border-red-50 text-left bg-white rounded-[2rem]">
            <h3 className="text-xl font-bold tracking-tight text-red-500 mb-4">Danger Zone</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 font-medium">
              Once you delete your agent or business account, there is no going back. Please be certain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="danger" className="h-12 px-8">Deactivate Agent</Button>
              <Button variant="ghost" className="h-12 px-8 text-slate-300 hover:text-red-500">Delete Account</Button>
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave}
              className="h-14 px-12 rounded-[2rem] shadow-2xl shadow-black/10" 
              isLoading={isSaving}
            >
              <Save size={18} className="mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
