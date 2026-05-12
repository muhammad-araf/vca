"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  items: any[];
  total: number;
  status: string;
  transcript: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((current) => [payload.new as Order, ...current]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((current) =>
            current.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Restaurant Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Live Order Management System</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Live
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-gray-500">
                    #{order.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-green-500/20 text-green-500"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-1">
                  {order.customer_name || "Guest Customer"}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>

                <div className="space-y-2 mb-6">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.qty}x {item.name}
                      </span>
                      <span className="text-gray-500">${item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/5 flex justify-between font-bold text-blue-400">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>

                {order.address && (
                  <div className="mb-6 p-3 bg-white/5 rounded-lg text-xs text-gray-400">
                    <p className="font-semibold text-gray-300 mb-1">Delivery Address:</p>
                    {order.address}
                  </div>
                )}

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <button
                      onClick={() => updateStatus(order.id, "completed")}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      alert(order.transcript || "No transcript available");
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors"
                  >
                    Transcript
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-gray-500">No orders yet. Start your first call!</p>
          </div>
        )}
      </div>
    </div>
  );
}
