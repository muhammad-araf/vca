"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, Play, Square, 
  RefreshCw, MessageSquare, 
  ChevronRight, Volume2,
  PhoneCall, Terminal
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

import { useVoiceChat } from '@/hooks/useVoiceChat';
import { createClient } from "@/lib/supabase/client";
import Ambience from '../../components/Ambience';

export default function Simulator() {
  const [agentKey, setAgentKey] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [businessName, setBusinessName] = useState("Vocalink Partner");
  
  const { 
    inCall, 
    status, 
    transcript, 
    startCall, 
    endCall, 
    isAISpeaking, 
    rmsValue,
    sendText 
  } = useVoiceChat(agentKey);

  useEffect(() => {
    const fetchAgent = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase.from('businesses').select('id, name').eq('user_id', user.id).single();
      if (biz) {
        setBusinessName(biz.name);
        const { data: agent } = await supabase.from('agents').select('widget_key').eq('business_id', biz.id).eq('is_active', true).limit(1).single();
        if (agent) setAgentKey(agent.widget_key);
      }
    };
    fetchAgent();
  }, []);

  useEffect(() => {
    let timer: any;
    if (inCall && status === "Connected") {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall, status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-medium tracking-tighter mb-2 text-slate-900">AI Call Simulator</h2>
          <p className="text-slate-400 font-medium text-lg">Test your agent's Urdu and English conversational flow in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="purple" className="px-4 py-1.5 border-none font-medium text-[10px] uppercase tracking-widest bg-slate-100 text-slate-400">v2.4 Engine</Badge>
          <Badge className="px-4 py-1.5 border-none font-medium text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600">Online</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Call Controls & Visualizer */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="p-12 border-none bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[4rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-attractive-gradient opacity-50" />
            <Ambience isActive={inCall} isAISpeaking={isAISpeaking} />
            
            <div className="relative z-10 flex flex-col items-center py-10">
              <div className="mb-12 relative">
                <AnimatePresence>
                  {inCall && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5 + (rmsValue * 2), opacity: 0.2 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="absolute inset-0 bg-black/5 rounded-full blur-3xl -z-10" 
                    />
                  )}
                </AnimatePresence>
                
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${inCall ? 'bg-black shadow-[0_0_50px_rgba(0,0,0,0.2)]' : 'bg-slate-100'}`}>
                  {inCall ? (
                    <Mic className="w-12 h-12 text-white animate-pulse" />
                  ) : (
                    <MicOff className="w-12 h-12 text-slate-300" />
                  )}
                </div>
              </div>

              <div className="text-center mb-16">
                <h3 className="text-3xl font-black mb-3 tracking-tighter text-slate-900">
                  {inCall ? (status === "Connected" ? 'Agent is Listening...' : status) : 'Start a Voice Session'}
                </h3>
                <div className="flex items-center justify-center gap-3">
                  {inCall && status === "Connected" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-lg font-black text-slate-400 font-mono tracking-widest">{formatTime(callDuration)}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">{agentKey ? 'Ready for simulation' : 'No active agent found'}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8">
                {!inCall ? (
                  <Button 
                    onClick={startCall}
                    disabled={!agentKey}
                    size="lg" 
                    className="h-20 px-16 rounded-[2.5rem] bg-black text-white hover:bg-slate-900 shadow-2xl shadow-black/20 text-xl font-black uppercase tracking-widest group disabled:opacity-30"
                  >
                    <Play size={24} className="mr-4 group-hover:scale-110 transition-transform" />
                    Start Call
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button 
                      onClick={endCall}
                      size="lg" 
                      variant="danger"
                      className="h-20 px-12 rounded-[2.5rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-red-500/10"
                    >
                      <Square size={24} className="mr-3" />
                      Hang Up
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Waves */}
            {inCall && (
              <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-center gap-1.5 px-10 pb-10 overflow-hidden pointer-events-none">
                {[...Array(40)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: 10 + (rmsValue * 150 * (Math.sin(i / 3) + 1.2)) }}
                    transition={{ duration: 0.1 }}
                    className="w-1 bg-black/10 rounded-full"
                  />
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-8">
            <Card className="p-8 border-none bg-slate-900 text-white shadow-2xl rounded-[3rem] group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Terminal size={20} className="text-white/60" />
                </div>
                <h4 className="font-medium uppercase tracking-widest text-xs">Internal Logic</h4>
              </div>
              <div className="space-y-3 font-mono text-[10px] text-white/40">
                <p className="flex justify-between"><span>Confidence Score</span> <span className="text-emerald-400">0.982</span></p>
                <p className="flex justify-between"><span>Detected Lang</span> <span className="text-white">Urdu-PK</span></p>
                <p className="flex justify-between"><span>Intent Type</span> <span className="text-white">Order_Placement</span></p>
                <div className="pt-4 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-medium uppercase tracking-widest text-emerald-400/50">Processing Stream...</span>
                </div>
              </div>
            </Card>
            <Card className="p-8 border-none bg-white shadow-xl rounded-[3rem] group border border-slate-50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Volume2 size={20} className="text-slate-400" />
                </div>
                <h4 className="font-medium uppercase tracking-widest text-xs text-slate-900">Voice Profile</h4>
              </div>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Using "Saira (Natural Urdu)" at 1.1x speed with Pakistani context.
              </p>
              <Button variant="ghost" className="mt-4 h-10 px-4 text-[10px] font-medium uppercase tracking-widest text-slate-300 hover:text-black">Change Voice</Button>
            </Card>
          </div>
        </div>

        {/* Real-time Transcription */}
        <div className="lg:col-span-5 h-full">
          <Card className="h-full flex flex-col border-none bg-white shadow-xl rounded-[4rem] overflow-hidden border border-slate-50">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-slate-900" />
                <h3 className="font-medium text-slate-900 tracking-tight">Live Transcription</h3>
              </div>
              <Badge variant="info" className="text-[8px] border-none uppercase tracking-widest">Real-time</Badge>
            </div>
            
            <div className="flex-grow p-8 overflow-y-auto space-y-8 scrollbar-hide max-h-[600px]">
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-6 py-20">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                    <PhoneCall size={32} className="text-slate-300" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest max-w-[150px]">The transcript will appear here once the call starts.</p>
                </div>
              ) : (
                transcript.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-black text-white rounded-tr-none shadow-2xl' 
                        : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] font-medium text-slate-300 mt-3 uppercase tracking-widest">
                      {msg.role === 'user' ? 'Customer' : 'AI Agent'} • Just now
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder={inCall ? "Type a message to simulate user..." : "Start call to simulate..."}
                  disabled={!inCall}
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black uppercase tracking-tight focus:ring-2 focus:ring-black/5 focus:outline-none transition-all disabled:opacity-50 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inCall) {
                      const input = e.currentTarget;
                      if (input.value) {
                        sendText(input.value);
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl p-0"
                  disabled={!inCall}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
