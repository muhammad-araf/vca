"use client";

import React, { useState } from 'react';
import { 
  Globe, Key, Smartphone, 
  MessageCircle, Copy, Check, 
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function Integration() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const widgetCode = `<script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget.js" data-agent="YOUR_AGENT_KEY"></script>`;
  const apiKey = `vk_live_${Math.random().toString(36).substring(7).toUpperCase()}${Math.random().toString(36).substring(7).toUpperCase()}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Deploy & Integrate</h2>
        <p className="text-slate-400 font-medium">Connect your AI Voice Agent to your website, phone systems, and messaging apps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Website Integration */}
          <Card className="p-8 border-none bg-white relative overflow-hidden card-shadow">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
              <Globe size={100} />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 flex items-center justify-center">
                <Globe size={24} className="text-slate-900" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">Website Widget</h3>
                <Badge variant="purple" className="mt-1 border-none">Easiest Method</Badge>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              Add a floating voice assistant to your website. Customers can click and talk directly to your business from any browser.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Embed Code</span>
                <button 
                  onClick={() => copyToClipboard(widgetCode, 'widget')}
                  className="text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center gap-2"
                >
                  {copiedId === 'widget' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Code</>}
                </button>
              </div>
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 font-mono text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
                {widgetCode}
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Deployment Steps</h4>
              <div className="space-y-4">
                {[
                  "Copy the unique widget script above",
                  "Paste it before the closing </body> tag in your HTML",
                  "Save and refresh your website",
                  "VocaLink agent will appear automatically"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">{i + 1}</div>
                    <p className="text-sm text-slate-600 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* API Access */}
          <Card className="p-8 border-none bg-white card-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 flex items-center justify-center">
                <Key size={24} className="text-slate-900" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">API Access</h3>
                <Badge variant="info" className="mt-1 border-none">For Developers</Badge>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              Build custom integrations using our robust Voice API. Perfect for connecting with your existing CRM or POS.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Secret API Key</span>
                <button 
                  onClick={() => copyToClipboard(apiKey, 'api')}
                  className="text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center gap-2"
                >
                  {copiedId === 'api' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Key</>}
                </button>
              </div>
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 font-mono text-xs text-slate-500 flex items-center justify-between">
                <span className="font-bold">{apiKey.substring(0, 15)}••••••••••••••••</span>
                <ShieldCheck size={16} className="text-slate-300" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 border-none bg-white card-shadow">
            <h4 className="text-lg font-bold mb-6 tracking-tight text-slate-900">Upcoming Channels</h4>
            <div className="space-y-6">
              {[
                { icon: <Smartphone />, name: 'Phone System', desc: 'Direct SIM/VOIP calls', status: 'Beta' },
                { icon: <MessageCircle />, name: 'WhatsApp', desc: 'Voice notes handling', status: 'Waitlist' },
                { icon: <Zap />, name: 'Zapier', desc: '2000+ automations', status: 'Coming Soon' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-black">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{item.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-8 h-12">View Documentation</Button>
          </Card>

          <Card className="p-8 border-none bg-slate-900">
            <h4 className="text-lg font-bold mb-4 tracking-tight text-white">Need Help?</h4>
            <p className="text-sm text-white/50 leading-relaxed mb-8 font-medium">
              Our engineering team can help you deploy the widget or build custom logic for your business.
            </p>
            <Button variant="secondary" className="w-full h-12 bg-white text-black hover:bg-slate-100">
              Book Tech Support
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
