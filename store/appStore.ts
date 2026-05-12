import { create } from "zustand";
import { Business, Agent } from "@/types";

interface AppStore {
  business: Business | null;
  agents: Agent[];
  setBusiness: (b: Business | null) => void;
  setAgents: (a: Agent[]) => void;
  addAgent: (a: Agent) => void;
  updateAgent: (a: Agent) => void;
  removeAgent: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  business: null,
  agents: [],
  setBusiness: (business) => set({ business }),
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((s) => ({ agents: [agent, ...s.agents] })),
  updateAgent: (agent) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === agent.id ? agent : a)) })),
  removeAgent: (id) =>
    set((s) => ({ agents: s.agents.filter((a) => a.id !== id) })),
}));
