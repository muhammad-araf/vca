"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { 
  BarChart3, TrendingUp, Users, 
  Clock, Calendar, Download, 
  ArrowUpRight, ArrowDownRight, 
  Activity, PieChart
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

const AnalyticsCard = ({ title, value, change, isPositive, icon, delay }: { title: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <Card className="p-10 border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[3.5rem] group overflow-hidden relative">
      <div className="absolute inset-0 bg-attractive-gradient opacity-30" />
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 group-hover:scale-110 transition-transform duration-700">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-medium text-slate-300 uppercase tracking-[0.3em] mb-4">{title}</p>
        <div className="flex items-end gap-5">
          <h4 className="text-5xl font-medium tracking-tighter text-slate-900">{value}</h4>
          <div className={`flex items-center gap-1 text-[11px] font-medium mb-2 px-3 py-1 rounded-full ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);


export default function Analytics() {
  const [stats, setStats] = useState({
    revenue: "Rs. 0",
    avgDuration: "0m",
    conversionRate: "0%",
    totalCalls: "0"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
      if (business) {
        const { data: agent } = await supabase.from('agents').select('id').eq('business_id', business.id).single();
        
        if (agent) {
          // Fetch analytics from DB
          const { data: analyticsData } = await supabase
            .from('analytics')
            .select('*')
            .eq('agent_id', agent.id)
            .order('date', { ascending: false })
            .limit(1);

          // Fetch orders to calculate revenue
          const { data: ordersData } = await supabase
            .from('orders')
            .select('total, status')
            .eq('business_id', business.id)
            .eq('status', 'confirmed');

          let totalRevenue = 0;
          if (ordersData) {
            totalRevenue = ordersData.reduce((acc, order) => acc + (order.total || 0), 0);
          }

          if (analyticsData && analyticsData.length > 0) {
            const a = analyticsData[0];
            const mins = (a.avg_duration_secs / 60).toFixed(1);
            setStats({
              revenue: `Rs. ${(totalRevenue / 1000).toFixed(1)}k`,
              avgDuration: `${mins}m`,
              conversionRate: `${a.conversion_rate}%`,
              totalCalls: a.total_calls.toString()
            });
          }
        }
      }
      setIsLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h2 className="text-4xl font-medium tracking-tighter mb-3 text-slate-900">Performance Analytics</h2>
          <p className="text-slate-400 font-medium text-lg">Deep insights into how your AI voice agent is growing your business.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-[2rem] border border-slate-50 shadow-sm flex items-center">
            {['24h', '7d', '30d', '90d'].map((tab) => (
              <button 
                key={tab} 
                className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-medium uppercase tracking-widest transition-all ${tab === '7d' ? 'bg-black text-white shadow-xl' : 'text-slate-300 hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Button variant="secondary" className="h-14 px-8 rounded-[2rem] bg-white border border-slate-50 shadow-sm">
            <Calendar size={18} className="mr-3" />
            Custom
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnalyticsCard 
          title="Revenue Generated" 
          value={stats.revenue} 
          change="+18.4%" 
          isPositive={true} 
          icon={<TrendingUp size={64} />} 
          delay={0.1}
        />
        <AnalyticsCard 
          title="Avg. Call Duration" 
          value={stats.avgDuration} 
          change="-4.2%" 
          isPositive={true} 
          icon={<Clock size={64} />} 
          delay={0.2}
        />
        <AnalyticsCard 
          title="Conversion Rate" 
          value={stats.conversionRate} 
          change="+2.1%" 
          isPositive={true} 
          icon={<Users size={64} />} 
          delay={0.3}
        />
        <AnalyticsCard 
          title="Total Calls" 
          value={stats.totalCalls} 
          change="+12.5%" 
          isPositive={true} 
          icon={<Activity size={64} />} 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-12 border-none bg-white shadow-2xl rounded-[4rem] overflow-hidden relative border border-slate-50">
          <div className="absolute inset-0 bg-attractive-gradient opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-16">
              <div>
                <h3 className="text-3xl font-medium tracking-tight text-slate-900">Conversion Trends</h3>
                <p className="text-[10px] text-slate-300 uppercase tracking-[0.3em] font-medium mt-2">Successful orders vs inquiries</p>
              </div>
              <Button variant="secondary" className="h-12 px-6 rounded-2xl bg-slate-50/50 border-none">
                <Download size={16} className="mr-2" />
                Report
              </Button>
            </div>
            
            <div className="h-80 flex items-end justify-between gap-10 px-6">
              {[60, 45, 75, 55, 90, 65, 80].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                  <div className="w-full relative flex items-center justify-center gap-2 h-full">
                    <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${val}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full max-w-[32px] bg-black rounded-3xl group-hover:scale-x-110 transition-transform duration-500 relative shadow-2xl shadow-black/10"
                    />
                    <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${val * 0.6}%` }}
                      transition={{ duration: 1, delay: (i * 0.1) + 0.2 }}
                      className="w-full max-w-[32px] bg-slate-100 rounded-3xl group-hover:scale-x-110 transition-transform duration-500 shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-200 mt-8 uppercase tracking-widest">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-12 border-none bg-white shadow-2xl rounded-[4rem] border border-slate-50">
          <h3 className="text-3xl font-medium tracking-tight text-slate-900 mb-10">Peak Hours</h3>
          <div className="space-y-10">
            {[
              { time: '1:00 PM - 3:00 PM', count: '450 calls', load: 85 },
              { time: '8:00 PM - 11:00 PM', count: '620 calls', load: 95 },
              { time: '10:00 AM - 11:00 AM', count: '120 calls', load: 30 }
            ].map((peak, i) => (
              <div key={i} className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-slate-900 tracking-tight">{peak.time}</span>
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-widest">{peak.count}</span>
                  </div>
                  <Badge variant={peak.load > 80 ? 'danger' : 'success'} className="border-none py-1.5 px-4 font-medium text-[9px] uppercase tracking-widest">
                    {peak.load > 80 ? 'High Load' : 'Stable'}
                  </Badge>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${peak.load}%` }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                    className={`h-full rounded-full ${peak.load > 80 ? 'bg-black' : 'bg-slate-200'}`} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <Activity size={20} className="text-slate-900" />
              <h4 className="text-sm font-medium text-slate-900 uppercase tracking-widest">System Tip</h4>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Based on peak traffic, we recommend enabling "High Concurrency Mode" for your agent during 8 PM - 11 PM.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="p-12 border-none bg-black text-white rounded-[4rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <PieChart size={120} />
          </div>
          <div className="relative z-10">
            <h4 className="text-3xl font-medium mb-6 tracking-tighter">Language Distribution</h4>
            <div className="flex items-center gap-12 mb-10">
              <div className="flex-1 space-y-6">
                {[
                  { lang: 'Urdu', val: 64, color: 'bg-white' },
                  { lang: 'Roman Urdu', val: 24, color: 'bg-white/40' },
                  { lang: 'English', val: 12, color: 'bg-white/10' }
                ].map((l, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                      <span>{l.lang}</span>
                      <span>{l.val}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${l.val}%` }}
                        className={`h-full ${l.color} rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block w-40 h-40 rounded-full border-[16px] border-white/5 relative">
                <div className="absolute inset-0 rounded-full border-[16px] border-white border-t-transparent border-r-transparent transform -rotate-45" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-medium">Urdu</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-12 border-none bg-white shadow-xl rounded-[4rem] border border-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-attractive-gradient opacity-20" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm">
                <BarChart3 size={24} />
              </div>
              <h4 className="text-2xl font-medium tracking-tight text-slate-900">Growth Projection</h4>
            </div>
            <p className="text-md text-slate-400 font-medium mb-12 leading-relaxed">
              Based on your current trajectory, your business is projected to save over <span className="text-slate-900 font-medium">240 man-hours</span> next month through AI call automation.
            </p>
            <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-emerald-600 font-medium">
                <TrendingUp size={20} />
                <span className="text-lg">+32% Project Growth</span>
              </div>
              <Button variant="ghost" className="h-12 px-6 rounded-2xl text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-slate-50">Detailed Plan</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
