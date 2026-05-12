"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, Zap, Globe, Package, 
  ArrowRight, CheckCircle2, MessageSquare, 
  PlayCircle, BarChart3, Users, 
  Store, Utensils, Scissors, HeartPulse, Wrench, GraduationCap, X
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import Navbar from './components/layout/Navbar';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-slate-200 bg-mesh-grey">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/40 rounded-full blur-[120px]" />
          <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-50/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] bg-pink-50/40 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              <Badge variant="purple" className="animate-subtle-slide bg-white/50 backdrop-blur-sm border-slate-100 px-4 py-1.5 font-bold">Urdu + Roman Urdu Support</Badge>
              <Badge className="animate-subtle-slide [animation-delay:200ms] bg-white/50 backdrop-blur-sm border-slate-100 px-4 py-1.5 font-bold">AI Call Automation</Badge>
              <Badge className="animate-subtle-slide [animation-delay:400ms] bg-white/50 backdrop-blur-sm border-slate-100 px-4 py-1.5 font-bold">Inventory-Aware Ordering</Badge>
            </div>
            
            <div className="py-2 overflow-visible">
              <h1 className="text-5xl md:text-8xl font-bold tracking-normal mb-8 pb-4 bg-clip-text text-transparent bg-gradient-to-b from-black to-slate-400 leading-[1.05]">
                Launch your AI voice <br className="hidden md:block" /> agent in minutes.
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-14 leading-relaxed font-normal">
              Vocalink helps businesses turn every customer call into an automated business action — <span className="text-slate-900 italic font-semibold">from hello to handled.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="w-full sm:w-auto h-18 px-14 group rounded-[2.5rem] text-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-none transition-all duration-500">
                Get Started
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto h-18 px-14 text-xl rounded-[2.5rem] hover:bg-white/50 backdrop-blur-sm">
                <PlayCircle className="mr-3 w-7 h-7" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl group"
          >
            <div className="bg-black/80 rounded-[3rem] p-4 border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src="/images/hero-mockup.png" 
                alt="Vocalink Dashboard Mockup" 
                className="w-full h-auto rounded-[2rem] object-cover relative z-10 opacity-90 group-hover:opacity-100 transition-opacity"
              />
              
              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 z-20 animate-float">
                <Badge variant="purple" className="bg-emerald-500 text-white border-none py-3 px-8 text-sm font-black rounded-full shadow-2xl">
                  AI CORE v2.0
                </Badge>
              </div>
            </div>
            
            {/* Visual glow under image */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-emerald-500/20 blur-[100px] pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-40 bg-vocalink-gradient border-y border-white relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-12 tracking-normal text-slate-900 leading-tight">
                Small businesses shouldn't <br /> 
                <span className="text-slate-400">be limited by manual calls.</span>
              </h2>
              <div className="space-y-10">
                {[
                  "Missing customer calls during busy hours",
                  "Losing orders due to staff dependency",
                  "Manual order writing on paper leads to errors",
                  "Zero real-time visibility into business metrics"
                ].map((text, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-6"
                  >
                    <div className="mt-1 w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-slate-600 font-medium text-xl">{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-8"
            >
              <Card className="p-10 text-center border-none bg-white/60 backdrop-blur-md shadow-2xl hover:scale-105 transition-transform duration-500 rounded-[3rem]">
                <div className="text-5xl font-bold text-slate-900 mb-2">30%</div>
                <div className="text-xs text-slate-300 uppercase tracking-[0.3em] font-bold">Missed Orders</div>
              </Card>
              <Card className="p-10 text-center border-none bg-white/60 backdrop-blur-md shadow-2xl hover:scale-105 transition-transform duration-500 rounded-[3rem]">
                <div className="text-5xl font-bold text-slate-900 mb-2">45%</div>
                <div className="text-xs text-slate-300 uppercase tracking-[0.3em] font-bold">Late Responses</div>
              </Card>
              <Card className="p-10 text-center col-span-2 border-none bg-white/60 backdrop-blur-md shadow-2xl rounded-[3rem]">
                <p className="text-lg text-slate-400 italic font-medium leading-relaxed">"Manual call handling is the bottleneck of modern SME growth."</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-40">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10 text-center md:text-left">
            <div>
              <Badge className="mb-6 bg-slate-100 text-slate-900 border-none px-5 py-2 font-bold uppercase tracking-widest text-[10px]">Use Cases</Badge>
              <h2 className="text-5xl md:text-6xl font-bold tracking-normal text-slate-900 leading-tight">Built for local industries.</h2>
            </div>
            <p className="text-slate-400 max-w-sm font-medium text-xl leading-relaxed">Vocalink adapts to the specific needs of your business type and industry flow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: <Utensils />, title: "Restaurants", tag: "Order Taking" },
              { icon: <HeartPulse />, title: "Clinics", tag: "Appointments" },
              { icon: <Scissors />, title: "Salons", tag: "Booking" },
              { icon: <Wrench />, title: "Repair Shops", tag: "Service Status" },
              { icon: <Store />, title: "Retail Stores", tag: "Inventory Check" },
              { icon: <GraduationCap />, title: "Tuition Centers", tag: "Registration" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-12 hover:bg-vocalink-gradient transition-all duration-700 cursor-default border-slate-50 hover:shadow-2xl group rounded-[3.5rem] bg-white text-center md:text-left">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-10 text-slate-400 group-hover:bg-black group-hover:text-white group-hover:scale-110 transition-all duration-700 mx-auto md:mx-0">
                    {React.cloneElement(item.icon as React.ReactElement, { className: "w-10 h-10" } as any)}
                  </div>
                  <h4 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">{item.title}</h4>
                  <Badge variant="default" className="text-[10px] border-none bg-slate-100 font-bold px-4 py-1.5 uppercase tracking-widest text-slate-400">{item.tag}</Badge>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-40 bg-slate-50/50 border-y border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <Badge variant="purple" className="mb-8 px-6 py-2 border-none font-bold text-xs uppercase tracking-widest">The Solution</Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-normal max-w-5xl mx-auto text-slate-900 leading-tight">
            Your business, <span className="text-slate-300">now with a tireless</span> AI voice agent.
          </h2>
          <p className="text-2xl text-slate-500 max-w-4xl mx-auto leading-relaxed mb-28 font-normal">
            Vocalink gives every business its own AI voice employee that can talk, understand multiple languages, act on orders, and report everything to your dashboard.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <MessageSquare />, title: "Multilingual Support", desc: "Understand Urdu, Roman Urdu, and English perfectly. No language barrier." },
              { icon: <Zap />, title: "Instant Action", desc: "The agent doesn't just talk. It updates inventory, creates orders instantly." },
              { icon: <BarChart3 />, title: "Real-time Visibility", desc: "Watch every conversation and transaction as it happens on your dashboard." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="group hover:border-slate-200 transition-all duration-700 text-left p-12 hover:shadow-2xl h-full border-slate-50 bg-white rounded-[3.5rem]">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform group-hover:bg-black group-hover:text-white transition-colors duration-700">
                    {React.cloneElement(feature.icon as React.ReactElement, { className: "w-10 h-10" } as any)}
                  </div>
                  <h3 className="text-3xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">{feature.title}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-40 relative overflow-hidden bg-mesh-grey">
        <div className="container mx-auto px-6">
          <div className="text-center mb-28">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-normal text-slate-900">How to launch in 5 steps</h2>
            <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.3em]">Setup to deployment in &lt; 10 mins.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-10">
            {[
              { icon: <Users />, title: "Sign Up", desc: "Create your business profile" },
              { icon: <Store />, title: "Details", desc: "Add hours and locations" },
              { icon: <Package />, title: "Inventory", desc: "Add your menu or services" },
              { icon: <Globe />, title: "Deploy", desc: "Launch your AI voice agent" },
              { icon: <BarChart3 />, title: "Track", desc: "Monitor calls and orders" }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-10 text-center group"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-white flex items-center justify-center mx-auto mb-10 relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-700 border border-slate-50">
                  {React.cloneElement(step.icon as React.ReactElement, { className: "w-10 h-10 text-slate-900" } as any)}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center shadow-2xl">
                    {i + 1}
                  </div>
                </div>
                <h4 className="font-bold mb-4 text-2xl text-slate-900 tracking-tight">{step.title}</h4>
                <p className="text-md text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                {i < 4 && (
                  <div className="hidden lg:block absolute top-1/4 left-[85%] w-full h-[2px] bg-gradient-to-r from-slate-100 to-transparent pointer-events-none" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 bg-vocalink-gradient border-y border-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-28">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-normal text-slate-900">Simple, scalable pricing.</h2>
            <p className="text-slate-400 font-bold text-xl">Choose the plan that fits your business volume.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {[
              { title: "Starter", price: "29", desc: "Perfect for small websites.", features: ["Website voice agent", "Basic call simulation", "Limited orders (50/mo)", "Basic dashboard"], primary: false },
              { title: "Business", price: "79", desc: "For established local shops.", features: ["Everything in Starter", "Urdu/Roman Urdu support", "Inventory-aware ordering", "Orders dashboard", "Advanced Analytics"], primary: true },
              { title: "Enterprise", price: "Custom", desc: "For large franchises.", features: ["Everything in Business", "Multiple agents", "Staff assignment", "Human handoff", "Custom integrations"], primary: false }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="h-full"
              >
                <Card className={`p-16 flex flex-col h-full transition-all duration-700 border-none hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[4rem] ${plan.primary ? 'border-2 border-black scale-105 shadow-2xl bg-white relative z-10' : 'bg-white/60 backdrop-blur-md'}`}>
                  {plan.primary && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[12px] font-bold uppercase tracking-[0.4em] px-10 py-3 rounded-full shadow-2xl">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-14">
                    <h4 className="text-3xl font-bold mb-4 text-slate-900 uppercase tracking-normal">{plan.title}</h4>
                    <div className="text-6xl font-bold mb-6 text-slate-900 tracking-normal">${plan.price}{plan.price !== 'Custom' && <span className="text-2xl font-bold text-slate-400">/mo</span>}</div>
                    <p className="text-lg text-slate-400 font-medium">{plan.desc}</p>
                  </div>
                  <div className="space-y-6 mb-16 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-5 text-lg text-slate-600 font-medium">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button variant={plan.primary ? 'primary' : 'secondary'} className={`w-full h-20 rounded-[2.5rem] text-xl font-bold ${plan.primary ? 'shadow-2xl shadow-black/20' : ''}`}>
                    {plan.price === 'Custom' ? 'Contact Sales' : `Get ${plan.title}`}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-mesh-grey opacity-50" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-6xl md:text-8xl font-bold mb-12 tracking-normal text-slate-900 leading-tight">Ready to hire your <br /> AI employee?</h2>
            <p className="text-2xl text-slate-500 mb-20 max-w-3xl mx-auto font-medium leading-relaxed">
              Join hundreds of local businesses automating their growth with Vocalink. No credit card required to start.
            </p>
            <Button size="lg" className="h-24 px-20 text-2xl rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-y-2 transition-all duration-700 font-bold uppercase tracking-widest">
              Start Your Free Trial
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-40 border-t border-slate-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-24 mb-32">
            <div className="col-span-2">
              <div className="flex items-center gap-5 mb-12">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-2xl shadow-black/10">
                  <Zap className="w-8 h-8 text-white" fill="currentColor" />
                </div>
                <span className="text-4xl font-bold tracking-tight text-slate-900 uppercase">Vocalink</span>
              </div>
              <p className="text-slate-400 text-xl max-w-sm leading-relaxed font-medium">
                Empowering Pakistani SMEs with high-performance AI voice agents. Automated. Intelligent. Multilingual.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-12 text-xs uppercase tracking-[0.4em] text-slate-900">Product</h5>
              <ul className="space-y-8 text-lg text-slate-500 font-medium">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-12 text-xs uppercase tracking-[0.4em] text-slate-900">Company</h5>
              <ul className="space-y-8 text-lg text-slate-500 font-medium">
                <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-20 border-t border-slate-50 text-[11px] text-slate-300 font-bold tracking-[0.4em] uppercase">
            <div>© 2026 Vocalink AI. All rights reserved. Built for SMEs.</div>
            <div className="flex gap-16">
              <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-slate-900 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
