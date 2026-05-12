"use client";

import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free", price: "$0", period: "/month",
    desc: "Perfect for testing and small projects.",
    features: ["1 AI agent", "100 conversations/mo", "Basic analytics", "Community support"],
    current: true, cta: "Current Plan",
  },
  {
    name: "Pro", price: "$49", period: "/month",
    desc: "For businesses scaling their voice operations.",
    features: ["5 AI agents", "5,000 conversations/mo", "Advanced analytics", "Priority support", "Custom prompts", "Knowledge base upload", "Widget embed"],
    current: false, cta: "Upgrade to Pro", highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "",
    desc: "Tailored for large organizations with custom needs.",
    features: ["Unlimited agents", "Unlimited conversations", "Dedicated infrastructure", "Custom integrations", "SLA guarantee", "White-label", "Dedicated support"],
    current: false, cta: "Contact Sales",
  },
];

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-zinc-500 text-sm mt-1">Manage your subscription and usage</p>
      </div>

      {/* Current usage */}
      <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] mb-8">
        <h3 className="text-white font-semibold text-sm mb-5">Current Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Conversations", used: 34, limit: 100 },
            { label: "Agents", used: 1, limit: 1 },
            { label: "Knowledge entries", used: 0, limit: 10 },
          ].map((u) => (
            <div key={u.label}>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-400">{u.label}</span>
                <span className="text-white">{u.used} / {u.limit}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${Math.min((u.used / u.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-6 rounded-2xl border ${
              plan.highlight ? "border-white/20 bg-white/[0.06]" : "border-white/[0.06] bg-white/[0.02]"
            }`}
          >
            {plan.highlight && (
              <span className="text-xs text-white bg-white/10 px-2 py-0.5 rounded-full inline-block mb-4">Recommended</span>
            )}
            <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
            <div className="mb-2">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-zinc-500 text-sm">{plan.period}</span>
            </div>
            <p className="text-zinc-500 text-xs mb-5">{plan.desc}</p>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check size={12} className="text-white shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              disabled={plan.current}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                plan.current
                  ? "border border-white/[0.06] text-zinc-600 cursor-default"
                  : plan.highlight
                  ? "bg-white text-black hover:bg-zinc-100"
                  : "border border-white/[0.08] text-white hover:bg-white/[0.04]"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
