"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, 
  Eye, 
  Clock, Truck, UserCircle2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { createClient } from "@/lib/supabase/client";

type OrderStatus = 'New' | 'Confirmed' | 'Preparing' | 'Completed' | 'Cancelled';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  items: string;
  notes: string;
  status: OrderStatus;
  staff: string;
  time: string;
  db_id: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
      if (business) {
        setBusinessId(business.id);
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('business_id', business.id)
          .order('created_at', { ascending: false });

        if (ordersData) {
          const formattedOrders = ordersData.map(o => {
            let itemsString = "";
            let notesString = "-";
            try {
              const parsedItems = JSON.parse(o.items);
              itemsString = parsedItems.map((i: any) => `${i.name} x${i.qty}`).join(', ');
            } catch (e) {
              itemsString = o.items;
            }
            
            let displayStatus: OrderStatus = 'New';
            if (o.status === 'confirmed') displayStatus = 'Confirmed';
            if (o.status === 'preparing') displayStatus = 'Preparing';
            if (o.status === 'completed') displayStatus = 'Completed';
            if (o.status === 'cancelled') displayStatus = 'Cancelled';
            if (o.status === 'pending') displayStatus = 'New';

            return {
              id: `ORD-${o.id.substring(0, 4).toUpperCase()}`,
              db_id: o.id,
              customerName: o.customer_name || 'Unknown',
              phone: o.phone || '-',
              items: itemsString || '-',
              notes: notesString,
              status: displayStatus,
              staff: 'AI Waiter',
              time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          setOrders(formattedOrders);
        }
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!businessId) return;
    const supabase = createClient();
    
    // Realtime subscription for orders
    const channel = supabase.channel('realtime_orders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `business_id=eq.${businessId}` 
      }, (payload) => {
        // Refetch orders on change to keep it simple, or modify local state
        // Here we just fetch again for ease
        const refresh = async () => {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });
          
          if (ordersData) {
            const formattedOrders = ordersData.map(o => {
              let itemsString = "";
              let notesString = "-";
              try {
                const parsedItems = JSON.parse(o.items);
                itemsString = parsedItems.map((i: any) => `${i.name} x${i.qty}`).join(', ');
              } catch (e) {
                itemsString = o.items;
              }
              
              let displayStatus: OrderStatus = 'New';
              if (o.status === 'confirmed') displayStatus = 'Confirmed';
              if (o.status === 'preparing') displayStatus = 'Preparing';
              if (o.status === 'completed') displayStatus = 'Completed';
              if (o.status === 'cancelled') displayStatus = 'Cancelled';
              if (o.status === 'pending') displayStatus = 'New';

              return {
                id: `ORD-${o.id.substring(0, 4).toUpperCase()}`,
                db_id: o.id,
                customerName: o.customer_name || 'Unknown',
                phone: o.phone || '-',
                items: itemsString || '-',
                notes: notesString,
                status: displayStatus,
                staff: 'AI Waiter',
                time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            });
            setOrders(formattedOrders);
          }
        };
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'New': return <Badge variant="purple" className="border-none">New</Badge>;
      case 'Confirmed': return <Badge variant="info" className="border-none">Confirmed</Badge>;
      case 'Preparing': return <Badge variant="warning" className="border-none">Preparing</Badge>;
      case 'Completed': return <Badge variant="success" className="border-none">Completed</Badge>;
      case 'Cancelled': return <Badge variant="danger" className="border-none">Cancelled</Badge>;
      default: return <Badge className="border-none">Unknown</Badge>;
    }
  };

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === id);
    if (order && order.db_id) {
      const supabase = createClient();
      let dbStatus = 'pending';
      if (newStatus === 'Confirmed') dbStatus = 'confirmed';
      if (newStatus === 'Preparing') dbStatus = 'preparing';
      if (newStatus === 'Completed') dbStatus = 'completed';
      if (newStatus === 'Cancelled') dbStatus = 'cancelled';

      await supabase.from('orders').update({ status: dbStatus }).eq('id', order.db_id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">Orders Dashboard</h2>
          <p className="text-slate-400 font-medium">Real-time orders generated by your AI Voice Agent.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="h-12 shadow-sm">
            <Truck size={18} className="mr-2" />
            Manage Delivery
          </Button>
          <Button className="h-12 shadow-2xl shadow-black/5">
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none bg-white">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">New Orders</p>
          <p className="text-3xl font-bold text-slate-900">{orders.filter(o => o.status === 'New').length}</p>
        </Card>
        <Card className="p-6 border-none bg-white">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Confirmed</p>
          <p className="text-3xl font-bold text-blue-500">{orders.filter(o => o.status === 'Confirmed').length}</p>
        </Card>
        <Card className="p-6 border-none bg-white">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-500">{orders.filter(o => o.status === 'Preparing').length}</p>
        </Card>
        <Card className="p-6 border-none bg-white">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Completed</p>
          <p className="text-3xl font-bold text-emerald-500">{orders.filter(o => o.status === 'Completed').length}</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-none bg-white card-shadow">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by customer, phone or ID..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-black/5 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="h-9">
              <Filter size={14} className="mr-2" />
              All Status
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Items</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Staff</th>
                <th className="px-6 py-5">Time</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-5 text-center text-slate-400 text-sm font-medium">No orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold font-mono text-slate-400 tracking-tighter">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{order.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{order.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500 truncate font-medium">{order.items}</span>
                      {order.notes !== '-' && <span className="text-[10px] text-amber-600 font-bold truncate italic">Note: {order.notes}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserCircle2 size={14} className="text-slate-400" />
                      </div>
                      <span className="text-xs text-slate-500 font-bold">{order.staff}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300 text-[10px] uppercase font-bold tracking-widest">
                      <Clock size={12} />
                      {order.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        value=""
                        className="bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-[10px] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-black/5 appearance-none cursor-pointer hover:bg-slate-100 transition-all text-slate-500 outline-none"
                      >
                        <option value="">Status</option>
                        <option value="Confirmed">Confirm</option>
                        <option value="Preparing">Prepare</option>
                        <option value="Completed">Complete</option>
                        <option value="Cancelled">Cancel</option>
                      </select>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-900">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
