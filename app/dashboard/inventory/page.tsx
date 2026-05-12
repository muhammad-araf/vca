"use client";

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, 
  Edit3, Trash2,
  TrendingUp, AlertCircle, Filter, 
  ChevronRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

import { createClient } from "@/lib/supabase/client";

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, topSeller: 'N/A' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
      
      if (business) {
        const { data: inventoryData } = await supabase
          .from('inventory')
          .select('*')
          .eq('business_id', business.id)
          .order('created_at', { ascending: false });

        if (inventoryData) {
          setItems(inventoryData);
          
          const lowStockCount = inventoryData.filter(i => i.status === 'Low Stock' || i.stock < 20).length;
          
          // top seller is just the item with the highest stock for now to mock it since we don't have sales per item in the db yet
          const topItem = [...inventoryData].sort((a, b) => b.stock - a.stock)[0];

          setStats({
            totalItems: inventoryData.length,
            lowStock: lowStockCount,
            topSeller: topItem ? topItem.name : 'N/A'
          });
        }
      }
      setIsLoading(false);
    };

    fetchInventory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-medium tracking-tighter mb-3 text-slate-900">Inventory Management</h2>
          <p className="text-slate-400 font-medium text-lg">Your AI agent uses this data to answer customer inquiries about availability and pricing.</p>
        </div>
        <Button className="h-16 px-10 rounded-3xl shadow-2xl shadow-black/10 group text-md font-medium uppercase tracking-widest">
          <Plus size={20} className="mr-3 group-hover:rotate-90 transition-transform duration-500" />
          Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Items', value: stats.totalItems.toString().padStart(2, '0'), icon: <Package />, color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Low Stock Alerts', value: stats.lowStock.toString().padStart(2, '0'), icon: <AlertCircle />, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Top Seller', value: stats.topSeller, icon: <TrendingUp />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-8 border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[3rem] group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-slate-300 uppercase tracking-[0.3em] mb-4">{stat.label}</p>
                <p className={`text-4xl font-medium ${stat.color} tracking-tighter truncate max-w-[200px]`}>{stat.value}</p>
              </div>
              <div className={`w-16 h-16 rounded-[1.75rem] ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 28 } as any)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-white shadow-2xl rounded-[4rem] overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8 bg-attractive-gradient/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              className="w-full bg-white border border-slate-100 rounded-[2rem] py-4 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-black/5 focus:outline-none shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="secondary" className="h-14 px-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex-grow md:flex-grow-0">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
            <Button variant="secondary" className="h-14 px-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex-grow md:flex-grow-0">Export CSV</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-medium text-slate-300 uppercase tracking-[0.3em] border-b border-slate-50">
                <th className="px-10 py-6">Product Name</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Price</th>
                <th className="px-10 py-6">Stock Level</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                 <tr><td colSpan={6} className="px-10 py-8 text-center text-sm text-slate-400 font-medium">Loading inventory...</td></tr>
              ) : items.length === 0 ? (
                 <tr><td colSpan={6} className="px-10 py-8 text-center text-sm text-slate-400 font-medium">No inventory items found. Add your first item.</td></tr>
              ) : items.map((item, i) => (
                <motion.tr 
                  key={item.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group cursor-default"
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all duration-500 flex-shrink-0">
                        <Package size={20} />
                      </div>
                      <span className="text-lg font-medium text-slate-900 tracking-tight whitespace-nowrap">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-sm font-medium text-slate-400 whitespace-nowrap">{item.category}</td>
                  <td className="px-10 py-8">
                    <span className="text-md font-medium text-slate-900 whitespace-nowrap">Rs. {item.price}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (item.stock / 150) * 100)}%` }}
                          className={`h-full rounded-full ${item.stock < 20 ? 'bg-red-500' : 'bg-black'}`} 
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-300 whitespace-nowrap">{item.stock} units</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <Badge 
                      variant={(item.status === 'In Stock' && item.stock >= 20) ? 'success' : 'warning'} 
                      className="px-4 py-1.5 border-none font-medium text-[10px] uppercase tracking-widest shadow-sm whitespace-nowrap"
                    >
                      {item.stock < 20 ? 'Low Stock' : item.status}
                    </Badge>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-400 hover:text-black">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-2.5 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2.5 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-400">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-10 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Showing {Math.min(items.length, 5)} of {items.length} products</p>
          <div className="flex items-center gap-4">
            <Button variant="secondary" className="h-12 w-12 p-0 rounded-xl" disabled>
              <ChevronRight size={20} className="rotate-180" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-black text-white text-xs font-medium">1</span>
            </div>
            <Button variant="secondary" className="h-12 w-12 p-0 rounded-xl" disabled={items.length <= 5}>
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-12 border-none bg-black text-white relative overflow-hidden group rounded-[4rem]">
        <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-10 translate-y-[-10px] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000">
          <TrendingUp size={160} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-4xl font-medium mb-6 tracking-tighter leading-tight">Sync your inventory with <br /> POS or Excel.</h3>
          <p className="text-lg text-white/50 mb-10 font-medium">
            Keep your AI agent always up-to-date with your physical stock. Automatically update item availability in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Button className="w-full sm:w-auto h-16 px-12 bg-white text-black hover:bg-slate-100 rounded-[2rem] font-medium uppercase tracking-widest">Connect POS</Button>
            <Button variant="outline" className="w-full sm:w-auto h-16 px-12 border-white/20 text-white hover:bg-white/10 rounded-[2rem] font-medium uppercase tracking-widest">Import Excel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
