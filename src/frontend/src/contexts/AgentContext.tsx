import * as React from 'react';
import type { IAgent, IAgentPump, IUpdatePumpSlot, AgentContextType } from './Agent';
import { API_BASE } from '../config';

export const AgentContext = React.createContext<AgentContextType | null>(null);

const SSE_URL = `${API_BASE}/agents/events`;

const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = React.useState<IAgent[]>([]);
  const [agentPumps, setAgentPumps] = React.useState<Record<number, IAgentPump[]>>({});

  // Fetch initial agent list on mount
  const fetchAgents = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/agents`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  React.useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Open SSE stream and update agent status on events
  React.useEffect(() => {
    const es = new EventSource(SSE_URL);

    es.addEventListener('agent-status', (event: MessageEvent) => {
      try {
        const { agentId, isOnline, lastSeen } = JSON.parse(event.data) as {
          agentId: string;
          isOnline: boolean;
          lastSeen: string;
        };
        setAgents(prev =>
          prev.map(agent =>
            agent.agentId === agentId ? { ...agent, isOnline, lastSeen } : agent
          )
        );
      } catch (err) {
        console.error('Failed to parse agent-status event:', err);
      }
    });

    es.onerror = () => {
      console.error('SSE connection error for agent events');
    };

    return () => {
      es.close();
    };
  }, []);

  const dispense = async (recipeId: number) => {
    const agent = agents.find(a => a.isOnline);
    if (!agent) return;
    try {
      const response = await fetch(`${API_BASE}/agents/${agent.id}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      if (!response.ok) throw new Error(`Dispense failed: ${response.status}`);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchAgentPumps = React.useCallback(async (agentId: number) => {
    try {
      const response = await fetch(`${API_BASE}/agents/${agentId}/pumps`);
      if (!response.ok) throw new Error('Failed to fetch pumps');
      const data: IAgentPump[] = await response.json();
      setAgentPumps(prev => ({ ...prev, [agentId]: data }));
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const updateAgentName = async (id: number, name: string) => {
    try {
      const response = await fetch(`${API_BASE}/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to rename agent');
      setAgents(prev => prev.map(a => a.id === id ? { ...a, name } : a));
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const updateAgentPumps = async (id: number, pumps: IUpdatePumpSlot[]) => {
    try {
      const response = await fetch(`${API_BASE}/agents/${id}/pumps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pumps),
      });
      if (!response.ok) throw new Error('Failed to update pumps');
      await fetchAgentPumps(id);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const value: AgentContextType = {
    agents,
    agentPumps,
    dispense,
    fetchAgentPumps,
    updateAgentName,
    updateAgentPumps,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

// Hook to use the context
export const useAgents = () => {
  const context = React.useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within AgentProvider');
  }
  return context;
};

export default AgentProvider;
