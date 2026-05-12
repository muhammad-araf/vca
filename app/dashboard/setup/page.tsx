"use client";

import React, { useState, useEffect } from 'react';
import { Save, Info, Store, Globe, MapPin, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function Setup() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Restaurant',
    workingHours: '',
    phoneNumber: '',
    deliveryAreas: '',
    businessAddress: '',
    supportLanguage: 'Urdu + Roman Urdu + English',
    handoffNumber: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase.from('businesses').select('*').eq('user_id', user.id).single();
      if (business) {
        setFormData({
          businessName: business.name || '',
          businessType: business.business_type || 'Restaurant',
          workingHours: business.working_hours || '',
          phoneNumber: business.phone || '',
          deliveryAreas: business.delivery_areas || '',
          businessAddress: business.address || '',
          supportLanguage: business.language || 'Urdu + Roman Urdu + English',
          handoffNumber: business.handoff_number || '',
        });
      }
    };
    fetchBusiness();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from('businesses').update({
      name: formData.businessName,
      business_type: formData.businessType,
      working_hours: formData.workingHours,
      phone: formData.phoneNumber,
      delivery_areas: formData.deliveryAreas,
      address: formData.businessAddress,
      language: formData.supportLanguage,
      handoff_number: formData.handoffNumber,
    }).eq('user_id', user.id);

    if (!error) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Business Configuration</h2>
          <p className="text-slate-400 font-medium">Configure your agent's knowledge and operational boundaries.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl animate-in zoom-in">
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold text-emerald-900">Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-10 border-none bg-white card-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <Store size={20} className="text-slate-900" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">General Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. The Gourmet Burger"
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 appearance-none outline-none"
                >
                  <option>Restaurant</option>
                  <option>Clinic</option>
                  <option>Salon</option>
                  <option>Repair Service</option>
                  <option>Retail Store</option>
                  <option>Tuition Center</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Contact Phone</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+92 300 0000000"
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Working Hours</label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  placeholder="e.g. 10 AM - 11 PM"
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 outline-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-10 border-none bg-white card-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <MapPin size={20} className="text-slate-900" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Location & Logistics</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Business Address</label>
                <textarea
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Full physical address of your business"
                  className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 resize-none outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Delivery / Service Areas</label>
                <input
                  type="text"
                  name="deliveryAreas"
                  value={formData.deliveryAreas}
                  onChange={handleChange}
                  placeholder="e.g. Gulberg, DHA Phase 5, Model Town"
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 outline-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-10 border-none bg-white card-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <Globe size={20} className="text-slate-900" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">AI Agent Behavior</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Support Language</label>
                <select
                  name="supportLanguage"
                  value={formData.supportLanguage}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 appearance-none outline-none"
                >
                  <option>Urdu</option>
                  <option>Roman Urdu</option>
                  <option>English</option>
                  <option>Urdu + Roman Urdu + English</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Human Handoff Number</label>
                <input
                  type="tel"
                  name="handoffNumber"
                  value={formData.handoffNumber}
                  onChange={handleChange}
                  placeholder="+92 300 1234567"
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 outline-none"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-10 bg-slate-900 border-none shadow-2xl">
            <h4 className="text-lg font-bold mb-6 tracking-tight text-white">Setup Status</h4>
            <div className="space-y-4 mb-10">
              {[
                { label: 'Business Profile', done: !!formData.businessName },
                { label: 'Operating Hours', done: !!formData.workingHours },
                { label: 'Logistics Info', done: !!formData.businessAddress },
                { label: 'AI Configuration', done: true }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
                  {item.done ? <Badge variant="success" className="text-[7px] border-none bg-white/10 text-white">Done</Badge> : <Badge className="text-[7px] border-none bg-white/5 text-white/20">Wait</Badge>}
                </div>
              ))}
            </div>
            <div className="h-[1px] bg-white/10 mb-8" />
            <Button 
              type="submit" 
              className="w-full h-14 bg-white text-black hover:bg-slate-100 shadow-none rounded-[2rem]" 
              isLoading={isSaving}
            >
              <Save size={18} className="mr-2" />
              Save Settings
            </Button>
          </Card>

          <Card className="p-8 border-none bg-white card-shadow">
            <div className="flex items-center gap-3 text-slate-300 mb-4">
              <Info size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Pro Tip</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 italic font-medium">
              "Selecting 'Urdu + Roman Urdu' is recommended for local businesses in Pakistan to capture the widest range of customer intents."
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}
