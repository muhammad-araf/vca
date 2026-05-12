"use client";

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  PhoneCall, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  MessageSquare,
  ChevronRight,
  Plus,
  BarChart3,
  Package
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { createClient } from "@/lib/supabase/client";
import Link from 'next/link';

const StatCard = ({ title, value, change, isPositive, icon, delay, colorClass }: { title: string, value: string, change: string, isPositive: boolean, icon: any, delay: number, colorClass: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="p-10 border-none bg-white/60 backdrop-blur-md shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden relative rounded-[3.5rem]">
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`} />
      <div className="absolute top-0 right-0 p-10 text-slate-100 group-hover:text-slate-200 transition-colors group-hover:scale-110 transition-transform duration-700">
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-4">{title}</span>
        <div className="flex items-end gap-4">
          <span className="text-4xl font-black tracking-tighter text-slate-900">{value}</span>
          <div className={`flex items-center gap-1 text-[10px] font-black mb-1.5 px-3 py-1 rounded-full uppercase tracking-tighter ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function Overview() {
  const [businessName, setBusinessName] = useState("Partner");
  const [stats, setStats] = useState({ totalCalls: 0, ordersProcessed: 0, avgHandledTime: "0m 0s", conversionRate: "0%" });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      if (user.user_metadata?.business_name) {
        setBusinessName(user.user_metadata.business_name);
      }

      // Fetch business ID
      const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
      
      if (business) {
        // Fetch low stock
        const { data: lowStockData } = await supabase
          .from('inventory')
          .select('*')
          .eq('business_id', business.id)
          .eq('status', 'Low Stock')
          .limit(3);
        
        if (lowStockData) setLowStock(lowStockData);

        // Fetch top items
        const { data: topItemsData } = await supabase
          .from('inventory')
          .select('*')
          .eq('business_id', business.id)
          .order('stock', { ascending: false })
          .limit(2);
        
        if (topItemsData) setTopItems(topItemsData);

        // Fetch orders (recent activity & count)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('business_id', business.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          const todaysOrders = ordersData.filter(o => new Date(o.created_at) >= startOfDay);
          const mappedOrders = ordersData.slice(0, 4).map(o => ({
            type: 'order',
            customer: o.customer_name,
            text: `Order #${o.id} - ${o.status}`,
            time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: o.status
          }));
          
          setRecentActivity(mappedOrders);
          setStats(s => ({ ...s, ordersProcessed: todaysOrders.length }));
        }
      }

      // Fetch analytics (if agents are set up)
      const { data: agent } = await supabase.from('agents').select('id').eq('business_id', business?.id).single();
      if (agent) {
        const { data: analytics } = await supabase
          .from('analytics')
          .select('*')
          .eq('agent_id', agent.id)
          .order('date', { ascending: false })
          .limit(1);

        if (analytics && analytics.length > 0) {
          const a = analytics[0];
          const mins = Math.floor(a.avg_duration_secs / 60);
          const secs = Math.floor(a.avg_duration_secs % 60);
          
          setStats(s => ({
            ...s,
            totalCalls: a.total_calls,
            avgHandledTime: `${mins}m ${secs}s`,
            conversionRate: `${a.conversion_rate}%`
          }));
        }
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-medium tracking-normal mb-3 text-slate-900"
          >
            Welcome back, {businessName}!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 font-medium text-lg"
          >
            Your AI Voice Agent has been busy handling calls today.
          </motion.p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="purple" className="py-2 px-6 rounded-2xl border-none bg-black text-white font-medium animate-pulse">Live Now</Badge>
          <div className="h-6 w-[2px] bg-slate-100" />
          <span className="text-xs font-medium text-slate-300 uppercase tracking-[0.2em]">Last Sync: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Calls Today" 
          value={stats.totalCalls.toString()} 
          change="+12.5%" 
          isPositive={true} 
          icon={<PhoneCall size={64} />}
          delay={0.1}
          colorClass="bg-blue-500"
        />
        <StatCard 
          title="Orders Processed" 
          value={stats.ordersProcessed.toString()} 
          change="+8.2%" 
          isPositive={true} 
          icon={<Zap size={64} />}
          delay={0.2}
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="Avg Handled Time" 
          value={stats.avgHandledTime} 
          change="-4.1%" 
          isPositive={true} 
          icon={<Clock size={64} />}
          delay={0.3}
          colorClass="bg-purple-500"
        />
        <StatCard 
          title="Conversion Rate" 
          value={stats.conversionRate} 
          change="+2.4%" 
          isPositive={true} 
          icon={<TrendingUp size={64} />}
          delay={0.4}
          colorClass="bg-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-12 border-none bg-white/60 backdrop-blur-md shadow-2xl hover:shadow-2xl transition-shadow duration-500 rounded-[4rem]">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h3 className="text-2xl font-medium tracking-tight text-slate-900">Call Volume Analysis</h3>
              <p className="text-[10px] text-slate-300 uppercase tracking-[0.3em] mt-3 font-medium">Real-time engagement across languages</p>
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-black shadow-lg shadow-black/20" />
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Urdu</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">English</span>
              </div>
            </div>
          </div>
          
          <div className="h-72 flex items-end justify-between gap-6 px-4">
            {[40, 65, 45, 90, 75, 55, 85, 60, 45, 95, 80, 65].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                <div className="w-full relative flex items-center justify-center h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 1.2, delay: i * 0.05, ease: "easeOut" }}
                    className="w-full max-w-[20px] bg-slate-100 rounded-2xl group-hover:bg-black group-hover:shadow-2xl transition-all duration-500 relative"
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-medium px-4 py-2 rounded-xl shadow-2xl pointer-events-none">
                      {Math.round(val * 2.5)}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[9px] font-medium text-slate-200 uppercase tracking-widest mt-6">{i + 1}h</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-12 border-none bg-white/60 backdrop-blur-md shadow-2xl hover:shadow-2xl transition-shadow duration-500 rounded-[4rem]">
          <h3 className="text-2xl font-medium tracking-tight text-slate-900 mb-12">Recent Activity</h3>
          <div className="space-y-10">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 group cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-500">
                  {activity.type === 'order' ? <Plus size={18} /> : <MessageSquare size={18} />}
                </div>
                <div className="flex-grow flex flex-col min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-md font-medium truncate text-slate-900">{activity.customer}</span>
                    <span className="text-[10px] text-slate-300 whitespace-nowrap font-medium uppercase tracking-widest">{activity.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate leading-relaxed font-medium uppercase tracking-tight">{activity.text}</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-sm text-slate-400 font-medium">No recent activity</div>
            )}
          </div>
          <Button variant="ghost" className="w-full mt-14 h-16 text-xs font-medium uppercase tracking-[0.2em] hover:bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-50">View All Activity</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <Card className="p-10 border-none bg-white/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[4rem]">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-xl font-medium tracking-tight text-slate-900">Top Items</h4>
          </div>
          <div className="space-y-6">
            {topItems.length > 0 ? topItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/40 border border-white/50 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-default">
                <span className="text-md font-medium text-slate-700">{item.name}</span>
                <div className="flex items-center gap-5">
                  <span className="text-xs font-medium text-slate-300 uppercase">{item.stock}</span>
                  <Badge variant="success" className="text-[9px] border-none bg-emerald-50 text-emerald-600 font-medium px-3 py-1 rounded-full">Top</Badge>
                </div>
              </div>
            )) : (
              <div className="text-sm text-slate-400 font-medium">No inventory items</div>
            )}
          </div>
        </Card>

        <Card className="p-10 border-none bg-white/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[4rem]">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm">
              <Package size={24} />
            </div>
            <h4 className="text-xl font-medium tracking-tight text-slate-900">Low Stock</h4>
          </div>
          <div className="space-y-6">
            {lowStock.length > 0 ? lowStock.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/40 border border-white/50 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-default">
                <span className="text-md font-medium text-slate-700">{item.name}</span>
                <div className="flex items-center gap-5">
                  <span className="text-xs font-medium text-slate-300 uppercase">{item.stock} units</span>
                  <Badge variant="danger" className="text-[9px] border-none bg-red-50 text-red-600 font-medium px-3 py-1 rounded-full">Low</Badge>
                </div>
              </div>
            )) : (
              <div className="text-sm text-slate-400 font-medium">No low stock alerts</div>
            )}
          </div>
        </Card>

        <Card className="p-12 border-none bg-black text-white relative overflow-hidden group rounded-[4rem] shadow-2xl shadow-black/20">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <Zap size={140} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <Badge className="w-fit mb-8 bg-white/10 text-white border-none py-2 px-6 rounded-full font-medium text-[10px] uppercase tracking-widest">Action Required</Badge>
            <h4 className="text-3xl font-medium tracking-normal mb-8 leading-tight text-white">Run your first AI Call Simulation</h4>
            <p className="text-md text-white/50 mb-12 leading-relaxed font-medium">
              Test how your agent handles complex orders in Urdu before going live.
            </p>
            <Link href="/dashboard/simulator" className="w-full mt-auto">
              <Button className="w-full h-18 bg-white text-black hover:bg-slate-100 rounded-[2rem] font-medium text-lg shadow-2xl shadow-black/10">
                Start Simulation
                <ChevronRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
