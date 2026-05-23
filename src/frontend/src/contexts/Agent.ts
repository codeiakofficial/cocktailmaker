export interface IAgent {
  id: number
  name: string
  agentId: string
  isOnline: boolean
  lastSeen: string | null
}

export interface IAgentPump {
  pumpIndex: number
  ingredientId: number | null
  ingredientName: string | null
}

export interface IUpdatePumpSlot {
  pumpIndex: number
  ingredientId: number | null
}

export type AgentContextType = {
  agents: IAgent[]
  agentPumps: Record<number, IAgentPump[]>
  dispense: (recipeId: number) => Promise<void>
  fetchAgentPumps: (agentId: number) => Promise<void>
  updateAgentName: (id: number, name: string) => Promise<void>
  updateAgentPumps: (id: number, pumps: IUpdatePumpSlot[]) => Promise<void>
}
