import * as React from 'react';
import type { IAgent, AgentContextType } from './Agent';

export const AgentContext = React.createContext<AgentContextType | null>(null);

const API_URL = 'http://localhost:8080/api';
const SSE_URL = 'http://localhost:8080/api/agents/events';

const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = React.useState<IAgent[]>([]);

  // Fetch initial agent list on mount
  const fetchAgents = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/agent`);
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

  const value: AgentContextType = { agents };

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
