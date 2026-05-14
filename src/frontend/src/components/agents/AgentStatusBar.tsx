import { useAgents } from '../../contexts/AgentContext';

export function AgentStatusBar() {
  const { agents } = useAgents();

  if (agents.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {agents.map(agent => (
        <div key={agent.id} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full shrink-0 ${
              agent.isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}
            aria-label={agent.isOnline ? 'online' : 'offline'}
          />
          <span className="text-sm text-muted-foreground">{agent.name}</span>
        </div>
      ))}
    </div>
  );
}
