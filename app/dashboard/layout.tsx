"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Mic2, 
  Package, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  User,
  Plus,
  ShoppingCart,
  Link as LinkIcon,
  Cog
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { createClient } from "@/lib/supabase/client";

const NavItem = ({ icon: Icon, label, href, active, collapsed }: { icon: any, label: string, href: string, active: boolean, collapsed: boolean }) => (
  <Link 
    href={href} 
    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${
      active ? 'text-black font-bold' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'
    }`}
  >
    <Icon size={20} className={active ? 'text-black' : 'text-slate-300 group-hover:text-slate-900 transition-colors'} />
    {!collapsed && <span className="text-sm font-medium tracking-normal">{label}</span>}
    {active && (
      <motion.div 
        layoutId="active-nav"
        className="absolute left-0 w-1.5 h-6 bg-black rounded-r-full"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [businessName, setBusinessName] = useState("Vocalink Business");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? "");
      if (data.user?.user_metadata?.business_name) {
        setBusinessName(data.user.user_metadata.business_name);
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
    { icon: Mic2, label: 'Simulator', href: '/dashboard/simulator' },
    { icon: Package, label: 'Inventory', href: '/dashboard/inventory' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: LinkIcon, label: 'Integration', href: '/dashboard/integration' },
    { icon: Cog, label: 'Setup', href: '/dashboard/setup' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="flex h-screen bg-mesh-grey overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: collapsed ? 100 : 300 }}
        className="bg-white/30 backdrop-blur-xl border-r border-white/50 flex flex-col relative z-20"
      >
        <div className="p-8 mb-8 flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-black flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                <Zap size={20} className="text-white relative z-10" fill="currentColor" />
              </div>
              <span className="text-2xl font-black tracking-tight uppercase text-slate-900 leading-none">Vocalink</span>
            </Link>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-xl hover:bg-white/50 text-slate-400 transition-colors ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <NavItem 
                key={item.href} 
                {...item} 
                active={active} 
                collapsed={collapsed}
              />
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Card className="p-6 border-none bg-white/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-vocalink-gradient opacity-20 group-hover:opacity-40 transition-opacity" />
            {!collapsed ? (
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm font-medium text-slate-400">
                    {userEmail.charAt(0).toUpperCase() || "B"}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold tracking-normal truncate text-slate-900">{businessName}</span>
                    <Badge variant="purple" className="text-[8px] py-0 px-2 w-fit mt-1 border-none bg-purple-100 text-purple-600">Pro Plan</Badge>
                  </div>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  size="sm" 
                  className="w-full h-11 text-xs font-black uppercase tracking-widest border-slate-200 hover:bg-black hover:text-white hover:border-black transition-all rounded-xl shadow-sm"
                >
                  <LogOut size={14} className="mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="relative z-10 flex justify-center">
                <div 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm font-medium text-slate-400 cursor-pointer hover:bg-black hover:text-white transition-colors"
                >
                  <LogOut size={16} />
                </div>
              </div>
            )}
          </Card>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-full relative">
        <header className="h-24 bg-white/20 backdrop-blur-md border-b border-white/30 flex items-center justify-between px-10 relative z-10">
          <div className="flex items-center gap-6 w-full max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-white/50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-black/5 focus:bg-white transition-all shadow-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-3 rounded-2xl bg-white/50 text-slate-400 hover:text-black hover:bg-white transition-all shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-[1px] bg-slate-100 mx-2" />
            <button className="flex items-center gap-4 group p-1.5 pr-4 rounded-2xl hover:bg-white/50 transition-all">
              <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <User size={20} className="text-white" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{userEmail || "User"}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase">Business Owner</span>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-10 bg-transparent scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
