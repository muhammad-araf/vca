"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, CheckCircle2, Mail, Lock, Building, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      if (data.session) {
        // User is immediately signed in (email confirmation disabled)
        router.push("/dashboard");
      } else {
        // Email confirmation is enabled
        setSuccess(true);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-slate-50 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="p-8 relative z-10">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-black/10">
            <Zap className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">Vocalink</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          <div className="hidden md:block">
            <h1 className="text-4xl font-black mb-6 tracking-tight text-slate-900">Start your journey with <span className="text-slate-400">Vocalink.</span></h1>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">
              Join thousands of businesses that are automating their customer calls and growing their operations with AI.
            </p>
            
            <div className="space-y-6">
              {[
                "Launch your agent in under 10 minutes",
                "Full support for Urdu & Roman Urdu",
                "No credit card required for 14 days",
                "Dedicated Pakistani support team"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-slate-600 text-sm font-bold tracking-tight">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-10 border-none bg-white card-shadow rounded-[3rem]">
            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                  <Check className="text-emerald-500 w-10 h-10" />
                </div>
                <h1 className="text-slate-900 text-2xl font-black mb-4">Check your email</h1>
                <p className="text-slate-500 text-sm mb-8 font-medium">
                  We've sent a confirmation link to <span className="text-slate-900 font-bold">{email}</span>. Please click the link to activate your account.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="w-full h-14 rounded-[1.5rem]"
                >
                  Back to Sign Up
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black mb-2 text-slate-900">Create Business Account</h2>
                  <p className="text-sm text-slate-400 font-bold">Enter your details to get started.</p>
                </div>

                {error && (
                  <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Business Name</label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-black transition-colors" />
                      <input 
                        type="text" 
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        placeholder="Acme Corp"
                        className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-black transition-colors" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@company.com"
                        className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-black transition-colors" />
                      <input 
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-12 pr-12 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-black/5 focus:bg-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 ml-1 mt-1">Minimum 8 characters</p>
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading}
                    isLoading={loading}
                    className="w-full h-14 bg-black hover:bg-slate-800 rounded-[1.5rem] shadow-lg shadow-black/10 mt-2"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm font-bold text-slate-400">
                  Already have an account? <Link href="/login" className="text-black hover:underline">Log in</Link>
                </p>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
